import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import kotlinx.browser.window
import org.jetbrains.compose.web.dom.Button
import org.jetbrains.compose.web.dom.Div
import org.jetbrains.compose.web.dom.Text
import org.jetbrains.compose.web.renderComposable
import org.w3c.dom.CustomEvent

// Phase 0 验证：使用 Compose Web 的 DOM API（org.jetbrains.compose.web.dom）。
// 原因：Compose Multiplatform 1.9.0 的 Web 目标不提供 FontFamilyResolver 公共 API，
// Material3 的 Text 组件渲染时抛 "CompositionLocal LocalFontFamilyResolver not present"。
// DOM 文本不依赖 Compose 字体系统，可验证互操作核心机制（事件桥 + overlay 命中）。
@Composable
fun App() {
    var clicks by remember { mutableStateOf(0) }
    Div {
        Text("Compose Studio Preview Runtime (DOM)")
        Button(attrs = {
            id("button-1")
            onClick {
                clicks += 1
                // 事件桥（Phase 0 验证）：DOM 点击 → 通知 React overlay
                window.dispatchEvent(
                    CustomEvent(
                        "compose-web:activate",
                        js("{ detail: { nodeId: 'button-1' } }")
                    )
                )
            }
        }) {
            Text("Clicked $clicks times")
        }
    }
}

fun main() {
    renderComposable(rootElementId = "root") {
        App()
    }
}
