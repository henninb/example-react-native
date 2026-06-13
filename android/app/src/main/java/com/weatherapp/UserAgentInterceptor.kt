package com.weatherapp

import okhttp3.Interceptor
import okhttp3.Response

class UserAgentInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val original = chain.request()
        val spoofFlag = original.header(SPOOF_HEADER)

        val request = if (spoofFlag != null) {
            original.newBuilder()
                .removeHeader(SPOOF_HEADER)
                .header("User-Agent", PHANTOM_UA)
                .build()
        } else {
            original
        }

        return chain.proceed(request)
    }

    companion object {
        const val SPOOF_HEADER = "X-RN-Spoof-UA"
        const val PHANTOM_UA = "PhantomJS/react-native/brian"
    }
}
