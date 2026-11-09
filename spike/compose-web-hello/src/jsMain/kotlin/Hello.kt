import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.jetbrains.compose.web.renderComposable

@Composable
fun App() {
    var clicks by remember { mutableStateOf(0) }
    MaterialTheme {
        Column(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(text = "Compose Studio Preview Runtime")
            Button(onClick = { clicks += 1 }) {
                Text(text = "Clicked $clicks times")
            }
        }
    }
}

fun main() {
    renderComposable(rootElementId = "root") {
        App()
    }
}
