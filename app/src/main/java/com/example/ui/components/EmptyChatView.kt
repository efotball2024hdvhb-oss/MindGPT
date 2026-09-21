package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.MindGptBorder
import com.example.ui.theme.MindGptCard
import com.example.ui.theme.MindGptPrimary
import com.example.ui.theme.MindGptTextMuted
import com.example.ui.theme.MindGptTextPrimary
import com.example.ui.theme.MindGptTextSecondary

data class PromptSuggestion(
    val title: String,
    val description: String,
    val prompt: String,
    val icon: ImageVector,
    val color: Color
)

@Composable
fun EmptyChatView(
    onSelectPrompt: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val suggestions = listOf(
        PromptSuggestion(
            title = "برنامه‌نویسی و توسعه",
            description = "کدنویسی، دیباگ و بهینه‌سازی الگوریتم‌ها",
            prompt = "یک تابع در زبان کاتلین بنویس که لیست آیتم‌ها را فیلتر و مرتب کند.",
            icon = Icons.Default.Code,
            color = Color(0xFF64B5F6)
        ),
        PromptSuggestion(
            title = "تولید ایده خلاقانه",
            description = "ایده‌پردازی تجاری، نام‌گذاری و راهکارها",
            prompt = "۳ ایده جذاب و نوآورانه برای یک اپلیکیشن مبتنی بر هوش مصنوعی پیشنهاد بده.",
            icon = Icons.Default.Lightbulb,
            color = Color(0xFFFFD54F)
        ),
        PromptSuggestion(
            title = "نگارش و بازنویسی متن",
            description = "اصلاح ادبیات، ایمیل کاری و ترجمه",
            prompt = "این متن را با لحنی حرفه‌ای و محترمانه برای یک ایمیل کاری بازنویسی کن: «سلام کارهایی که گفتی رو تموم کردم لطفا چک کن»",
            icon = Icons.Default.Create,
            color = Color(0xFF81C784)
        ),
        PromptSuggestion(
            title = "تحلیل و تفکر عمیق",
            description = "بررسی داده‌ها، استدلال و تصمیم‌گیری",
            prompt = "مزایا و معایب استفاده از معماری میکروسرویس در برابر مونولیت را تحلیل کن.",
            icon = Icons.Default.AutoAwesome,
            color = Color(0xFFBA68C8)
        )
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // MindGPT Orb Logo
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(MindGptPrimary),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Psychology,
                contentDescription = "MindGPT",
                tint = Color.White,
                modifier = Modifier.size(42.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "چه کمکی می‌تونم بهت بکنم؟",
            color = MindGptTextPrimary,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "پاسخ سریع، دقیق و هوشمند با قدرت مدل‌های MindGPT",
            color = MindGptTextSecondary,
            fontSize = 13.sp,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Grid of prompt suggestion cards
        Column(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            suggestions.forEach { item ->
                Card(
                    onClick = { onSelectPrompt(item.prompt) },
                    colors = CardDefaults.cardColors(containerColor = MindGptCard),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MindGptBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(14.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(item.color.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = null,
                                tint = item.color,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.title,
                                color = MindGptTextPrimary,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = item.description,
                                color = MindGptTextSecondary,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
