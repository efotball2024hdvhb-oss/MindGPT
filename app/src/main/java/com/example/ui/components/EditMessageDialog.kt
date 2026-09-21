package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.local.ChatMessage
import com.example.ui.theme.MindGptBorder
import com.example.ui.theme.MindGptCard
import com.example.ui.theme.MindGptPrimary
import com.example.ui.theme.MindGptSurface
import com.example.ui.theme.MindGptTextMuted
import com.example.ui.theme.MindGptTextPrimary
import com.example.ui.theme.MindGptTextSecondary

@Composable
fun EditMessageDialog(
    message: ChatMessage,
    onDismiss: () -> Unit,
    onSubmit: (String) -> Unit
) {
    var text by remember { mutableStateOf(message.content) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = MindGptSurface,
            border = androidx.compose.foundation.BorderStroke(1.dp, MindGptBorder),
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
                .testTag("edit_message_dialog")
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = null,
                        tint = MindGptPrimary,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        text = "ویرایش پیام",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = MindGptTextPrimary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "با ویرایش این پیام، پاسخ هوش مصنوعی از این نقطه مجدداً تولید خواهد شد.",
                    fontSize = 12.sp,
                    color = MindGptTextSecondary
                )

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    maxLines = 6,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MindGptCard,
                        unfocusedContainerColor = MindGptCard,
                        focusedBorderColor = MindGptPrimary,
                        unfocusedBorderColor = MindGptBorder,
                        focusedTextColor = MindGptTextPrimary,
                        unfocusedTextColor = MindGptTextPrimary
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("edit_message_text_field")
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = MindGptTextSecondary
                        )
                    ) {
                        Text("لغو")
                    }

                    Spacer(modifier = Modifier.width(10.dp))

                    Button(
                        onClick = {
                            if (text.isNotBlank()) {
                                onSubmit(text)
                            }
                        },
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MindGptPrimary,
                            contentColor = Color.White
                        ),
                        modifier = Modifier.testTag("save_and_submit_button")
                    ) {
                        Text("ذخیره و ارسال", fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
