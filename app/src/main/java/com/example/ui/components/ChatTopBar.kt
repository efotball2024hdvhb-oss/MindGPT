package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.TravelExplore
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.UiState
import com.example.ui.theme.MindGptBorder
import com.example.ui.theme.MindGptCard
import com.example.ui.theme.MindGptDarkBg
import com.example.ui.theme.MindGptPrimary
import com.example.ui.theme.MindGptSurface
import com.example.ui.theme.MindGptTextMuted
import com.example.ui.theme.MindGptTextPrimary
import com.example.ui.theme.MindGptTextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatTopBar(
    uiState: UiState,
    onMenuClick: () -> Unit,
    onNewChatClick: () -> Unit,
    onModelSelect: (String) -> Unit,
    onToggleSearch: () -> Unit,
    onToggleThinking: () -> Unit
) {
    var showModelMenu by remember { mutableStateOf(false) }

    TopAppBar(
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MindGptDarkBg,
            titleContentColor = MindGptTextPrimary
        ),
        navigationIcon = {
            IconButton(
                onClick = onMenuClick,
                modifier = Modifier.testTag("menu_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = MindGptTextPrimary
                )
            }
        },
        title = {
            Box(contentAlignment = Alignment.Center) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(MindGptSurface)
                        .clickable { showModelMenu = true }
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                        .testTag("model_picker_button")
                ) {
                    Text(
                        text = "MindGPT",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = MindGptTextPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        color = MindGptCard,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = if (uiState.selectedModel.contains("Pro")) "Pro" else "4o",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                            color = MindGptPrimary,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = "Select Model",
                        tint = MindGptTextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }

                DropdownMenu(
                    expanded = showModelMenu,
                    onDismissRequest = { showModelMenu = false },
                    modifier = Modifier
                        .background(MindGptSurface)
                        .padding(8.dp)
                ) {
                    Text(
                        text = "انتخاب مدل هوش مصنوعی",
                        color = MindGptTextMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                    )

                    val models = listOf(
                        "MindGPT 4o" to "سریع‌ترین و همه‌فن‌حریف برای وظایف روزمره",
                        "MindGPT Pro" to "استدلال منطقی عمیق و حل مسائل پیچیده",
                        "MindGPT Flash Lite" to "فوق‌العاده سریع با کمترین تاخیر"
                    )

                    models.forEach { (modelName, desc) ->
                        DropdownMenuItem(
                            text = {
                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = modelName,
                                            fontWeight = FontWeight.SemiBold,
                                            color = MindGptTextPrimary,
                                            fontSize = 14.sp
                                        )
                                        if (uiState.selectedModel == modelName) {
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Icon(
                                                imageVector = Icons.Default.Check,
                                                contentDescription = "Selected",
                                                tint = MindGptPrimary,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                    Text(
                                        text = desc,
                                        color = MindGptTextSecondary,
                                        fontSize = 11.sp
                                    )
                                }
                            },
                            onClick = {
                                onModelSelect(modelName)
                                showModelMenu = false
                            }
                        )
                    }

                    HorizontalDivider(
                        color = MindGptBorder,
                        modifier = Modifier.padding(vertical = 6.dp)
                    )

                    // Web Search Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.TravelExplore,
                                contentDescription = null,
                                tint = if (uiState.isSearchEnabled) MindGptPrimary else MindGptTextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "جستجوی وب زنده",
                                color = MindGptTextPrimary,
                                fontSize = 13.sp
                            )
                        }
                        Switch(
                            checked = uiState.isSearchEnabled,
                            onCheckedChange = { onToggleSearch() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = MindGptPrimary
                            )
                        )
                    }

                    // Thinking Mode Toggle
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Psychology,
                                contentDescription = null,
                                tint = if (uiState.isThinkingEnabled) MindGptPrimary else MindGptTextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "حالت تفکر عمیق",
                                color = MindGptTextPrimary,
                                fontSize = 13.sp
                            )
                        }
                        Switch(
                            checked = uiState.isThinkingEnabled,
                            onCheckedChange = { onToggleThinking() },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = MindGptPrimary
                            )
                        )
                    }
                }
            }
        },
        actions = {
            IconButton(
                onClick = onNewChatClick,
                modifier = Modifier.testTag("new_chat_top_button")
            ) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "New Chat",
                    tint = MindGptTextPrimary
                )
            }
        }
    )
}
