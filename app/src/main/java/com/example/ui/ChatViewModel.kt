package com.example.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.ChatMessage
import com.example.data.local.ChatSession
import com.example.data.repository.ChatRepository
import com.example.util.SpeechHelper
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class UiState(
    val currentSession: ChatSession? = null,
    val isGenerating: Boolean = false,
    val isSearchEnabled: Boolean = false,
    val isThinkingEnabled: Boolean = false,
    val selectedModel: String = "MindGPT 4o",
    val editingMessage: ChatMessage? = null,
    val isVoiceModeActive: Boolean = false,
    val isSpeakingTts: Boolean = false,
    val searchQuery: String = ""
)

class ChatViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = ChatRepository(application)
    val speechHelper = SpeechHelper(application)

    val sessions: StateFlow<List<ChatSession>> = repository.getAllSessions()
        .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    init {
        viewModelScope.launch {
            val session = repository.getOrCreateCurrentSession()
            _uiState.value = _uiState.value.copy(currentSession = session)
            loadMessages(session.id)
        }
    }

    fun selectSession(session: ChatSession) {
        _uiState.value = _uiState.value.copy(currentSession = session)
        loadMessages(session.id)
    }

    fun startNewChat() {
        viewModelScope.launch {
            val newSession = repository.createNewSession("گفتگوی جدید")
            _uiState.value = _uiState.value.copy(currentSession = newSession)
            loadMessages(newSession.id)
        }
    }

    fun deleteSession(sessionId: String) {
        viewModelScope.launch {
            repository.deleteSession(sessionId)
            val remaining = repository.getAllSessions()
            val nextSession = repository.getOrCreateCurrentSession()
            _uiState.value = _uiState.value.copy(currentSession = nextSession)
            loadMessages(nextSession.id)
        }
    }

    private fun loadMessages(sessionId: String) {
        viewModelScope.launch {
            repository.getMessages(sessionId).collect { msgs ->
                _messages.value = msgs
            }
        }
    }

    fun toggleSearch() {
        _uiState.value = _uiState.value.copy(isSearchEnabled = !_uiState.value.isSearchEnabled)
    }

    fun toggleThinking() {
        _uiState.value = _uiState.value.copy(isThinkingEnabled = !_uiState.value.isThinkingEnabled)
    }

    fun setModel(model: String) {
        _uiState.value = _uiState.value.copy(selectedModel = model)
    }

    fun startEditingMessage(message: ChatMessage) {
        _uiState.value = _uiState.value.copy(editingMessage = message)
    }

    fun cancelEditing() {
        _uiState.value = _uiState.value.copy(editingMessage = null)
    }

    fun submitEdit(newContent: String) {
        val target = _uiState.value.editingMessage ?: return
        val session = _uiState.value.currentSession ?: return
        _uiState.value = _uiState.value.copy(editingMessage = null, isGenerating = true)

        viewModelScope.launch {
            val modelCode = when (_uiState.value.selectedModel) {
                "MindGPT Pro" -> "gemini-2.5-pro"
                "MindGPT Flash Lite" -> "gemini-2.5-flash"
                else -> "gemini-2.5-flash"
            }
            repository.sendMessage(
                sessionId = session.id,
                userPrompt = newContent,
                modelName = modelCode,
                isSearchEnabled = _uiState.value.isSearchEnabled,
                isThinkingEnabled = _uiState.value.isThinkingEnabled,
                editMessageId = target.id
            )
            _uiState.value = _uiState.value.copy(isGenerating = false)
        }
    }

    fun sendMessage(prompt: String) {
        if (prompt.isBlank() || _uiState.value.isGenerating) return
        val session = _uiState.value.currentSession ?: return

        _uiState.value = _uiState.value.copy(isGenerating = true)

        viewModelScope.launch {
            val modelCode = when (_uiState.value.selectedModel) {
                "MindGPT Pro" -> "gemini-2.5-pro"
                "MindGPT Flash Lite" -> "gemini-2.5-flash"
                else -> "gemini-2.5-flash"
            }
            repository.sendMessage(
                sessionId = session.id,
                userPrompt = prompt,
                modelName = modelCode,
                isSearchEnabled = _uiState.value.isSearchEnabled,
                isThinkingEnabled = _uiState.value.isThinkingEnabled
            )
            _uiState.value = _uiState.value.copy(isGenerating = false)
        }
    }

    fun deleteMessage(messageId: String) {
        viewModelScope.launch {
            repository.deleteMessage(messageId)
        }
    }

    fun speakText(text: String) {
        _uiState.value = _uiState.value.copy(isSpeakingTts = true)
        speechHelper.speak(text)
    }

    fun stopSpeaking() {
        _uiState.value = _uiState.value.copy(isSpeakingTts = false)
        speechHelper.stop()
    }

    fun setVoiceMode(active: Boolean) {
        _uiState.value = _uiState.value.copy(isVoiceModeActive = active)
        if (!active) {
            stopSpeaking()
        }
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    override fun onCleared() {
        super.onCleared()
        speechHelper.shutdown()
    }
}
