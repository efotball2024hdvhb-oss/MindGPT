package com.example.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.ChatMessage
import com.example.ui.theme.MindGptBorder
import com.example.ui.theme.MindGptCard
import com.example.ui.theme.MindGptPrimary
import com.example.ui.theme.MindGptSurface
import com.example.ui.theme.MindGptTextMuted
import com.example.ui.theme.MindGptTextPrimary
import com.example.ui.theme.MindGptTextSecondary
import com.example.ui.theme.MindGptUserBubble

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MessageBubble(
    message: ChatMessage,
    onEditMessage: (ChatMessage) -> Unit,
    onDeleteMessage: (String) -> Unit,
    onSpeakText: (String) -> Unit,
    onRegenerate: () -> Unit
) {
    val context = LocalContext.current
    var showContextMenu by remember { mutableStateOf(false) }

    val isUser = message.role == "user"

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 6.dp),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        if (isUser) {
            // User message bubble with long-press detection
            Box {
                Surface(
                    shape = RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp, bottomStart = 18.dp, bottomEnd = 4.dp),
                    color = MindGptUserBubble,
                    modifier = Modifier
                        .clip(RoundedCornerShape(topStart = 18.dp, topEnd = 18.dp, bottomStart = 18.dp, bottomEnd = 4.dp))
                        .combinedClickable(
                            onClick = { /* normal tap */ },
                            onLongClick = {
                                showContextMenu = true
                            }
                        )
                        .testTag("user_message_${message.id}")
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = message.content,
                            color = MindGptTextPrimary,
                            fontSize = 15.sp,
                            lineHeight = 22.sp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        // Quick edit pencil icon
                        IconButton(
                            onClick = { onEditMessage(message) },
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Message",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                }

                // Long press context menu popup
                DropdownMenu(
                    expanded = showContextMenu,
                    onDismissRequest = { showContextMenu = false },
                    modifier = Modifier.background(MindGptSurface)
                ) {
                    DropdownMenuItem(
                        leadingIcon = {
                            Icon(Icons.Default.Edit, contentDescription = null, tint = MindGptPrimary)
                        },
                        text = {
                            Text("ویرایش پیام (Edit)", color = MindGptTextPrimary, fontWeight = FontWeight.SemiBold)
                        },
                        onClick = {
                            showContextMenu = false
                            onEditMessage(message)
                        }
                    )
                    DropdownMenuItem(
                        leadingIcon = {
                            Icon(Icons.Default.ContentCopy, contentDescription = null, tint = MindGptTextSecondary)
                        },
                        text = {
                            Text("کپی متن", color = MindGptTextPrimary)
                        },
                        onClick = {
                            showContextMenu = false
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("MindGPT Prompt", message.content))
                            Toast.makeText(context, "متن کپی شد", Toast.LENGTH_SHORT).show()
                        }
                    )
                    DropdownMenuItem(
                        leadingIcon = {
                            Icon(Icons.Default.Delete, contentDescription = null, tint = Color(0xFFFF5252))
                        },
                        text = {
                            Text("حذف پیام", color = Color(0xFFFF5252))
                        },
                        onClick = {
                            showContextMenu = false
                            onDeleteMessage(message.id)
                        }
                    )
                }
            }
        } else {
            // Assistant message
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                // MindGPT avatar
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(MindGptPrimary),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Psychology,
                        contentDescription = "MindGPT",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Column(modifier = Modifier.weight(1f)) {
                    if (message.isThinking) {
                        // Thinking indicator box
                        val infiniteTransition = rememberInfiniteTransition(label = "thinking_pulse")
                        val alpha by infiniteTransition.animateFloat(
                            initialValue = 0.4f,
                            targetValue = 1.0f,
                            animationSpec = infiniteRepeatable(
                                animation = tween(700, easing = FastOutSlowInEasing),
                                repeatMode = RepeatMode.Reverse
                            ),
                            label = "alpha"
                        )

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MindGptCard,
                            border = androidx.compose.foundation.BorderStroke(1.dp, MindGptBorder),
                            modifier = Modifier
                                .fillMaxWidth()
                                .alpha(alpha)
                                .padding(bottom = 8.dp)
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Psychology,
                                    contentDescription = null,
                                    tint = MindGptPrimary,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "MindGPT در حال تفکر و تدوین پاسخ است...",
                                    color = MindGptTextSecondary,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }

                    // Formatted content
                    FormattedMarkdownText(content = message.content)

                    Spacer(modifier = Modifier.height(6.dp))

                    // Action toolbar under assistant message
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        // Copy Button
                        IconButton(
                            onClick = {
                                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                clipboard.setPrimaryClip(ClipData.newPlainText("MindGPT Response", message.content))
                                Toast.makeText(context, "پاسخ کپی شد", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ContentCopy,
                                contentDescription = "Copy",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // TTS Voice Button
                        IconButton(
                            onClick = { onSpeakText(message.content) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                contentDescription = "Speak",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Regenerate Button
                        IconButton(
                            onClick = onRegenerate,
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Regenerate",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Like
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "بازخورد مثبت ثبت شد", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ThumbUp,
                                contentDescription = "Like",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        // Dislike
                        IconButton(
                            onClick = {
                                Toast.makeText(context, "بازخورد ثبت شد", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ThumbDown,
                                contentDescription = "Dislike",
                                tint = MindGptTextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FormattedMarkdownText(content: String) {
    val lines = content.split("\n")
    var inCodeBlock = false
    val codeLines = mutableListOf<String>()

    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        for (line in lines) {
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    // Close code block
                    val fullCode = codeLines.joinToString("\n")
                    CodeBlockCard(code = fullCode)
                    codeLines.clear()
                    inCodeBlock = false
                } else {
                    inCodeBlock = true
                }
            } else if (inCodeBlock) {
                codeLines.add(line)
            } else {
                Text(
                    text = line,
                    color = MindGptTextPrimary,
                    fontSize = 15.sp,
                    lineHeight = 23.sp
                )
            }
        }
        if (inCodeBlock && codeLines.isNotEmpty()) {
            CodeBlockCard(code = codeLines.joinToString("\n"))
        }
    }
}

@Composable
fun CodeBlockCard(code: String) {
    val context = LocalContext.current
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F0F0F)),
        shape = RoundedCornerShape(8.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, MindGptBorder),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFF1E1E1E))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Code",
                    color = MindGptTextMuted,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
                IconButton(
                    onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Code", code))
                        Toast.makeText(context, "کد کپی شد", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.size(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ContentCopy,
                        contentDescription = "Copy code",
                        tint = MindGptTextMuted,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
            Text(
                text = code,
                color = Color(0xFFE6E6E6),
                fontFamily = FontFamily.Monospace,
                fontSize = 13.sp,
                modifier = Modifier.padding(12.dp)
            )
        }
    }
}
