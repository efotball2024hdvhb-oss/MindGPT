package com.example.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import com.example.ui.components.ChatInputBar
import com.example.ui.components.ChatTopBar
import com.example.ui.components.EditMessageDialog
import com.example.ui.components.EmptyChatView
import com.example.ui.components.MessageBubble
import com.example.ui.components.NavigationDrawerContent
import com.example.ui.components.VoiceConversationScreen
import com.example.ui.theme.MindGptDarkBg
import kotlinx.coroutines.launch

@Composable
fun ChatScreen(
    viewModel: ChatViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val messages by viewModel.messages.collectAsState()
    val sessions by viewModel.sessions.collectAsState()

    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    // Auto-scroll to bottom when messages update
    LaunchedEffect(messages.size, uiState.isGenerating) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    if (uiState.isVoiceModeActive) {
        VoiceConversationScreen(
            isSpeaking = uiState.isSpeakingTts,
            onClose = { viewModel.setVoiceMode(false) },
            onSpeakPrompt = { prompt ->
                viewModel.sendMessage(prompt)
            }
        )
        return
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet {
                NavigationDrawerContent(
                    sessions = sessions,
                    currentSessionId = uiState.currentSession?.id,
                    searchQuery = uiState.searchQuery,
                    onSearchChange = { viewModel.setSearchQuery(it) },
                    onSessionClick = { session ->
                        viewModel.selectSession(session)
                        coroutineScope.launch { drawerState.close() }
                    },
                    onNewChatClick = {
                        viewModel.startNewChat()
                        coroutineScope.launch { drawerState.close() }
                    },
                    onDeleteSession = { sessionId ->
                        viewModel.deleteSession(sessionId)
                    }
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                ChatTopBar(
                    uiState = uiState,
                    onMenuClick = {
                        coroutineScope.launch {
                            if (drawerState.isClosed) drawerState.open() else drawerState.close()
                        }
                    },
                    onNewChatClick = { viewModel.startNewChat() },
                    onModelSelect = { viewModel.setModel(it) },
                    onToggleSearch = { viewModel.toggleSearch() },
                    onToggleThinking = { viewModel.toggleThinking() }
                )
            },
            bottomBar = {
                ChatInputBar(
                    uiState = uiState,
                    onSendMessage = { prompt ->
                        viewModel.sendMessage(prompt)
                    },
                    onVoiceClick = {
                        viewModel.setVoiceMode(true)
                    },
                    onToggleSearch = { viewModel.toggleSearch() },
                    onToggleThinking = { viewModel.toggleThinking() }
                )
            },
            containerColor = MindGptDarkBg,
            modifier = modifier
                .fillMaxSize()
                .testTag("chat_screen_scaffold")
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MindGptDarkBg)
            ) {
                if (messages.isEmpty()) {
                    EmptyChatView(
                        onSelectPrompt = { prompt ->
                            viewModel.sendMessage(prompt)
                        }
                    )
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier
                            .fillMaxSize()
                            .testTag("messages_lazy_column")
                    ) {
                        items(messages, key = { it.id }) { message ->
                            MessageBubble(
                                message = message,
                                onEditMessage = { msg ->
                                    viewModel.startEditingMessage(msg)
                                },
                                onDeleteMessage = { id ->
                                    viewModel.deleteMessage(id)
                                },
                                onSpeakText = { text ->
                                    viewModel.speakText(text)
                                },
                                onRegenerate = {
                                    // Find previous user message
                                    val userMsg = messages.filter { it.role == "user" }.lastOrNull()
                                    if (userMsg != null) {
                                        viewModel.submitEdit(userMsg.content)
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    // Edit message dialog when user long-presses their message
    if (uiState.editingMessage != null) {
        EditMessageDialog(
            message = uiState.editingMessage!!,
            onDismiss = { viewModel.cancelEditing() },
            onSubmit = { newText ->
                viewModel.submitEdit(newText)
            }
        )
    }
}
