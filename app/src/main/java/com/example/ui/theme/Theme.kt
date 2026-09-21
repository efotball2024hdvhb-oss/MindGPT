package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val MindGptColorScheme = darkColorScheme(
    primary = MindGptPrimary,
    onPrimary = Color.White,
    primaryContainer = MindGptCard,
    onPrimaryContainer = MindGptTextPrimary,
    secondary = MindGptCyan,
    onSecondary = Color.Black,
    tertiary = MindGptPurple,
    background = MindGptDarkBg,
    onBackground = MindGptTextPrimary,
    surface = MindGptSurface,
    onSurface = MindGptTextPrimary,
    surfaceVariant = MindGptCard,
    onSurfaceVariant = MindGptTextSecondary,
    outline = MindGptBorder
)

@Composable
fun MyApplicationTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = MindGptColorScheme,
        typography = Typography,
        content = content
    )
}
