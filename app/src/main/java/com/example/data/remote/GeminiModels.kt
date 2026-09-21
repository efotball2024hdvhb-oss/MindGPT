package com.example.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class GeminiRequest(
    val contents: List<ContentItem>,
    val systemInstruction: ContentItem? = null,
    val generationConfig: GenerationConfig? = null,
    val tools: List<ToolItem>? = null
)

@JsonClass(generateAdapter = true)
data class ContentItem(
    val role: String? = null,
    val parts: List<PartItem>
)

@JsonClass(generateAdapter = true)
data class PartItem(
    val text: String? = null,
    val inlineData: InlineData? = null
)

@JsonClass(generateAdapter = true)
data class InlineData(
    val mimeType: String,
    val data: String // Base64 encoded
)

@JsonClass(generateAdapter = true)
data class GenerationConfig(
    val temperature: Float? = null,
    val topP: Float? = null,
    val maxOutputTokens: Int? = null,
    val thinkingConfig: ThinkingConfig? = null
)

@JsonClass(generateAdapter = true)
data class ThinkingConfig(
    val thinkingBudget: Int? = null
)

@JsonClass(generateAdapter = true)
data class ToolItem(
    val googleSearch: GoogleSearchTool? = null
)

@JsonClass(generateAdapter = true)
class GoogleSearchTool

@JsonClass(generateAdapter = true)
data class GeminiResponse(
    val candidates: List<CandidateItem>? = null,
    val usageMetadata: UsageMetadata? = null,
    val error: GeminiError? = null
)

@JsonClass(generateAdapter = true)
data class CandidateItem(
    val content: ContentItem? = null,
    val finishReason: String? = null,
    val groundingMetadata: GroundingMetadata? = null
)

@JsonClass(generateAdapter = true)
data class GroundingMetadata(
    val webSearchQueries: List<String>? = null,
    val searchEntryPoint: SearchEntryPoint? = null,
    val groundingChunks: List<GroundingChunk>? = null
)

@JsonClass(generateAdapter = true)
data class SearchEntryPoint(
    val renderedContent: String? = null
)

@JsonClass(generateAdapter = true)
data class GroundingChunk(
    val web: WebChunk? = null
)

@JsonClass(generateAdapter = true)
data class WebChunk(
    val uri: String? = null,
    val title: String? = null
)

@JsonClass(generateAdapter = true)
data class UsageMetadata(
    val promptTokenCount: Int? = null,
    val candidatesTokenCount: Int? = null,
    val totalTokenCount: Int? = null
)

@JsonClass(generateAdapter = true)
data class GeminiError(
    val code: Int? = null,
    val message: String? = null,
    val status: String? = null
)
