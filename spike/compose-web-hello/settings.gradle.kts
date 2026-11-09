pluginManagement {
    repositories {
        maven("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
        maven("https://maven.aliyun.com/repository/public/")
        maven("https://repo.huaweicloud.com/repository/maven/")
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        maven("https://mirrors.cloud.tencent.com/nexus/repository/maven-public/")
        maven("https://maven.aliyun.com/repository/public/")
        maven("https://repo.huaweicloud.com/repository/maven/")
        mavenCentral()
        google()
    }
}

rootProject.name = "compose-web-hello"
