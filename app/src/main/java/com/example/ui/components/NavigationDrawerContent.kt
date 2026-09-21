package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.ChatSession
import com.example.ui.theme.MindGptBorder
import com.example.ui.theme.MindGptCard
import com.example.ui.theme.MindGptCardHover
import com.example.ui.theme.MindGptDarkBg
import com.example.ui.theme.MindGptPrimary
import com.example.ui.theme.MindGptSurface
import com.example.ui.theme.MindGptTextMuted
import com.example.ui.theme.MindGptTextPrimary
import com.example.ui.theme.MindGptTextSecondary

@Composable
fun NavigationDrawerContent(
    sessions: List<ChatSession>,
    currentSessionId: String?,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    onSessionClick: (ChatSession) -> Unit,
    onNewChatClick: () -> Unit,
    onDeleteSession: (String) -> Unit
) {
    val filteredSessions = if (searchQuery.isBlank()) {
        sessions
    } else {
        sessions.filter { it.title.contains(searchQuery, ignoreCase = true) }
    }

    Column(
        modifier = Modifier
            .fillMaxHeight()
            .width(300.dp)
            .background(MindGptDarkBg)
            .padding(16.dp)
    ) {
        // Search bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = onSearchChange,
            placeholder = {
                Text(
                    text = "جستجو در گفتگوها...",
                    color = MindGptTextMuted,
                    fontSize = 13.sp
                )
            },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = "Search",
                    tint = MindGptTextSecondary,
                    modifier = Modifier.size(20.dp)
                )
            },
            singleLine = true,
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MindGptSurface,
                unfocusedContainerColor = MindGptSurface,
                focusedBorderColor = MindGptPrimary,
                unfocusedBorderColor = Color.Transparent,
                focusedTextColor = MindGptTextPrimary,
                unfocusedTextColor = MindGptTextPrimary
            ),
            modifier = Modifier
                .fillMaxWidth()
                .testTag("drawer_search_field")
        )

        Spacer(modifier = Modifier.height(12.dp))

        // New Chat Button
        Surface(
            onClick = onNewChatClick,
            shape = RoundedCornerShape(12.dp),
            color = MindGptSurface,
            modifier = Modifier
                .fillMaxWidth()
                .testTag("drawer_new_chat_button")
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "New Chat",
                    tint = MindGptTextPrimary,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "گفتگوی جدید",
                    color = MindGptTextPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "تاریخچه گفتگوها",
            color = MindGptTextMuted,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 4.dp)
        )

        // Session list
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            items(filteredSessions, key = { it.id }) { session ->
                val isSelected = session.id == currentSessionId
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isSelected) MindGptCard else Color.Transparent)
                        .clickable { onSessionClick(session) }
                        .padding(horizontal = 12.dp, vertical = 10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ChatBubbleOutline,
                        contentDescription = null,
                        tint = if (isSelected) MindGptPrimary else MindGptTextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = session.title.ifBlank { "گفتگوی بدون عنوان" },
                        color = if (isSelected) MindGptTextPrimary else MindGptTextSecondary,
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(
                        onClick = { onDeleteSession(session.id) },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = MindGptTextMuted,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }

        HorizontalDivider(color = MindGptBorder, modifier = Modifier.padding(vertical = 12.dp))

        // Profile / Footer
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(MindGptSurface)
                .padding(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MindGptPrimary),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "M",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "کاربر MindGPT",
                    color = MindGptTextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "پلن هوشمند فعال",
                    color = MindGptPrimary,
                    fontSize = 11.sp
                )
            }
            Icon(
                imageVector = Icons.Default.Settings,
                contentDescription = "Settings",
                tint = MindGptTextSecondary,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
