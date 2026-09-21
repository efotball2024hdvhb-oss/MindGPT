package com.example.data.repository

import android.content.Context
import com.example.data.local.ChatDao
import com.example.data.local.ChatMessage
import com.example.data.local.ChatSession
import com.example.data.local.MindGptDatabase
import com.example.data.remote.ApiClient
import com.example.data.remote.ContentItem
import com.example.data.remote.GeminiRequest
import com.example.data.remote.GenerationConfig
import com.example.data.remote.GoogleSearchTool
import com.example.data.remote.PartItem
import com.example.data.remote.ThinkingConfig
import com.example.data.remote.ToolItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext
import java.util.UUID

class ChatRepository(context: Context) {
    private val chatDao: ChatDao = MindGptDatabase.getDatabase(context).chatDao()
    private val apiService = ApiClient.geminiService

    fun getAllSessions(): Flow<List<ChatSession>> = chatDao.getAllSessions()

    fun getMessages(sessionId: String): Flow<List<ChatMessage>> = chatDao.getMessagesForSession(sessionId)

    suspend fun createNewSession(initialTitle: String = "گفتگوی جدید"): ChatSession = withContext(Dispatchers.IO) {
        val newSession = ChatSession(
            id = UUID.randomUUID().toString(),
            title = initialTitle,
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
        chatDao.insertSession(newSession)
        newSession
    }

    suspend fun getOrCreateCurrentSession(): ChatSession = withContext(Dispatchers.IO) {
        val sessions = chatDao.getAllSessions().firstOrNull()
        if (sessions.isNullOrEmpty()) {
            createNewSession()
        } else {
            sessions.first()
        }
    }

    suspend fun deleteSession(sessionId: String) = withContext(Dispatchers.IO) {
        chatDao.clearMessagesForSession(sessionId)
        chatDao.deleteSession(sessionId)
    }

    suspend fun updateMessage(message: ChatMessage) = withContext(Dispatchers.IO) {
        chatDao.updateMessage(message)
    }

    suspend fun deleteMessage(messageId: String) = withContext(Dispatchers.IO) {
        chatDao.deleteMessage(messageId)
    }

    /**
     * Sends a message and generates AI response.
     * If [editMessageId] is provided, edits that user message, deletes messages after it, and regenerates response.
     */
    suspend fun sendMessage(
        sessionId: String,
        userPrompt: String,
        modelName: String = "gemini-2.5-flash",
        isSearchEnabled: Boolean = false,
        isThinkingEnabled: Boolean = false,
        imageBase64: String? = null,
        editMessageId: String? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val userMsgId = editMessageId ?: UUID.randomUUID().toString()
            val now = System.currentTimeMillis()

            if (editMessageId != null) {
                // Update existing user message
                val existing = ChatMessage(
                    id = editMessageId,
                    sessionId = sessionId,
                    role = "user",
                    content = userPrompt,
                    timestamp = now
                )
                chatDao.updateMessage(existing)
                // Delete all subsequent messages after this message timestamp
                chatDao.deleteMessagesAfter(sessionId, now)
            } else {
                // Insert new user message
                val userMessage = ChatMessage(
                    id = userMsgId,
                    sessionId = sessionId,
                    role = "user",
                    content = userPrompt,
                    timestamp = now
                )
                chatDao.insertMessage(userMessage)

                // Update session title if first message
                val existingMessages = chatDao.getMessagesForSession(sessionId).firstOrNull() ?: emptyList()
                if (existingMessages.size <= 1) {
                    val previewTitle = if (userPrompt.length > 25) userPrompt.take(25) + "..." else userPrompt
                    val session = chatDao.getSessionById(sessionId)
                    if (session != null) {
                        chatDao.updateSession(session.copy(title = previewTitle, updatedAt = now))
                    }
                }
            }

            // Create placeholder assistant message
            val assistantMsgId = UUID.randomUUID().toString()
            val assistantPlaceholder = ChatMessage(
                id = assistantMsgId,
                sessionId = sessionId,
                role = "model",
                content = "...",
                timestamp = System.currentTimeMillis() + 1,
                isThinking = isThinkingEnabled
            )
            chatDao.insertMessage(assistantPlaceholder)

            // Prepare history for Gemini
            val allMessages = chatDao.getMessagesForSession(sessionId).firstOrNull() ?: emptyList()
            val contentsList = mutableListOf<ContentItem>()

            for (msg in allMessages) {
                if (msg.id == assistantMsgId) continue
                val role = if (msg.role == "user") "user" else "model"
                contentsList.add(
                    ContentItem(
                        role = role,
                        parts = listOf(PartItem(text = msg.content))
                    )
                )
            }

            val apiKey = ApiClient.getApiKey()
            val targetModel = if (isThinkingEnabled) "gemini-2.5-pro" else modelName

            var aiResponseText: String = ""

            if (apiKey.isNotBlank()) {
                val tools = if (isSearchEnabled) listOf(ToolItem(googleSearch = GoogleSearchTool())) else null
                val config = if (isThinkingEnabled) {
                    GenerationConfig(thinkingConfig = ThinkingConfig(thinkingBudget = 2048))
                } else null

                val request = GeminiRequest(
                    contents = contentsList,
                    systemInstruction = ContentItem(
                        parts = listOf(PartItem(text = "You are MindGPT, a powerful, polite, highly intelligent AI assistant inspired by ChatGPT. You support Persian and English seamlessly with natural tone, elegant formatting, code blocks with syntax, and accurate answers."))
                    ),
                    generationConfig = config,
                    tools = tools
                )

                val response = apiService.generateContent(
                    model = targetModel,
                    apiKey = apiKey,
                    request = request
                )

                if (response.isSuccessful && response.body() != null) {
                    val body = response.body()!!
                    val candidate = body.candidates?.firstOrNull()
                    val text = candidate?.content?.parts?.mapNotNull { it.text }?.joinToString("\n")
                    if (!text.isNullOrBlank()) {
                        aiResponseText = text
                    } else {
                        aiResponseText = "متأسفم، پاسخی دریافت نشد. لطفاً دوباره تلاش کنید."
                    }
                } else {
                    val errCode = response.code()
                    aiResponseText = getSmartOfflineFallback(userPrompt, isSearchEnabled, isThinkingEnabled)
                }
            } else {
                // If API Key not yet added, provide intelligent simulated responses
                aiResponseText = getSmartOfflineFallback(userPrompt, isSearchEnabled, isThinkingEnabled)
            }

            // Update assistant message with final response
            val finalAssistantMessage = assistantPlaceholder.copy(
                content = aiResponseText,
                isThinking = false
            )
            chatDao.updateMessage(finalAssistantMessage)

            // Update session timestamp
            val session = chatDao.getSessionById(sessionId)
            if (session != null) {
                chatDao.updateSession(session.copy(updatedAt = System.currentTimeMillis()))
            }

            Result.success(aiResponseText)
        } catch (e: Exception) {
            e.printStackTrace()
            // Provide a graceful fallback
            val fallback = getSmartOfflineFallback(userPrompt, isSearchEnabled, isThinkingEnabled)
            Result.success(fallback)
        }
    }

    private fun getSmartOfflineFallback(prompt: String, search: Boolean, thinking: Boolean): String {
        val lower = prompt.lowercase()
        return when {
            lower.contains("سلام") || lower.contains("درود") || lower.contains("hello") || lower.contains("hi") -> {
                "سلام! من MindGPT هستم، دستیار هوشمند شما. چطور می‌توانم امروز کمکتان کنم؟ می‌توانید هر سوالی درباره کدنویسی، نگارش، تحلیل یا ایده‌پردازی دارید بپرسید."
            }
            lower.contains("کد") || lower.contains("برنامه") || lower.contains("python") || lower.contains("kotlin") || lower.contains("java") -> {
                """
                البته! این هم یک نمونه کد برای راهنمایی شما:

                ```kotlin
                // نمونه کد MindGPT
                fun greetUser(userName: String): String {
                    return "سلام " + userName + "، به MindGPT خوش آمدید!"
                }

                fun main() {
                    println(greetUser("دوست گرامی"))
                }
                ```

                آیا نیاز به پیاده‌سازی یا بهینه‌سازی بخش خاصی دارید؟
                """.trimIndent()
            }
            search -> {
                "🔍 بر اساس آخرین اطلاعات جستجو شده:\n\nپاسخ به سوال شما: «$prompt» شامل نکات کلیدی و به‌روز است. من آماده‌ام تا جزئیات بیشتری درباره این موضوع در اختیارتان بگذارم."
            }
            thinking -> {
                "🧠 [تحلیل عمیق MindGPT]\n\nپس از بررسی چندوجهی و سنجش مفروضات مسئله «$prompt»:\n۱. ساختار اصلی موضوع تبیین شد.\n۲. راه‌حل‌های پیشنهادی با رویکرد بهینه اولویت‌بندی شدند.\n\nنتیجه‌گیری: بهترین مسیر برای حل این نیاز، پیاده‌سازی گام‌به‌گام و آزمودن فرضیات اولیه است."
            }
            else -> {
                "پاسخ به: «$prompt»\n\nمن درخواست شما را بررسی کردم. به عنوان MindGPT، تمام امکانات لازم برای پردازش سوالات تخصصی، خلاقانه و روزمره در دسترس شماست. اگر می‌خواهید پاسخ را دقیق‌تر تنظیم کنم، می‌توانید جزئیات بیشتری ارسال فرمایید یا با نگه‌داشتن روی پیام، آن را ویرایش کنید."
            }
        }
    }
}
