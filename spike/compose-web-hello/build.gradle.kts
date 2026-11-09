plugins {
    kotlin("multiplatform") version "2.1.21"
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.21"
    id("org.jetbrains.compose") version "1.9.0"
}

kotlin {
    js(IR) {
        browser()
        binaries.executable()
    }

    sourceSets {
        val jsMain by getting {
            dependencies {
                implementation("org.jetbrains.compose.runtime:runtime:1.9.0")
                implementation("org.jetbrains.compose.foundation:foundation:1.9.0")
                implementation("org.jetbrains.compose.ui:ui:1.9.0")
                implementation("org.jetbrains.compose.material3:material3:1.9.0")
                implementation("org.jetbrains.compose.html:html-core:1.9.0")
            }
        }
    }
}
