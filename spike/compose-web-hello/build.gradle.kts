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
                // 直接依赖声明（Gradle 9.0 的 Version Catalog 访问器生成异常，
                // catalog 方案记入 Phase 1 评估；版本统一 1.9.0）
                implementation("org.jetbrains.compose.runtime:runtime:1.9.0")
                implementation("org.jetbrains.compose.foundation:foundation:1.9.0")
                implementation("org.jetbrains.compose.ui:ui:1.9.0")
                implementation("org.jetbrains.compose.material3:material3:1.9.0")
                implementation("org.jetbrains.compose.html:html-core:1.9.0")
            }
        }
    }
}
