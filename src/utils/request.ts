import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ElMessage, ElLoading } from 'element-plus';

// 响应数据格式接口
interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
}

// 请求配置扩展接口
interface CustomRequestConfig extends AxiosRequestConfig {
    showLoading?: boolean; // 是否显示loading
    showErrorMessage?: boolean; // 是否显示错误消息
}

// 创建axios实例
const request: AxiosInstance = axios.create({
    baseURL: '/api', // 使用代理路径
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    },
});

// loading实例
let loadingInstance: any = null;
let requestCount = 0;

// 显示loading
const showLoading = () => {
    if (requestCount === 0) {
        loadingInstance = ElLoading.service({
            text: '加载中...',
            background: 'rgba(0, 0, 0, 0.7)',
        });
    }
    requestCount++;
};

// 隐藏loading
const hideLoading = () => {
    requestCount--;
    if (requestCount <= 0) {
        requestCount = 0;
        if (loadingInstance) {
            loadingInstance.close();
            loadingInstance = null;
        }
    }
};

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // 显示loading
        const customConfig = config as CustomRequestConfig;
        if (customConfig.showLoading !== false) {
            showLoading();
        }

        // 添加认证token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 打印请求信息（开发环境）
        if (import.meta.env.DEV) {
            console.log('🚀 请求发送:', {
                url: config.url,
                method: config.method,
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        hideLoading();
        console.error('❌ 请求错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        hideLoading();

        // 打印响应信息（开发环境）
        if (import.meta.env.DEV) {
            console.log('✅ 响应接收:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        // 检查HTTP状态码
        if (response.status >= 200 && response.status < 300) {
            // HTTP请求成功，返回数据
            return response.data;
        } else {
            return Promise.reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
        }
    },
    (error: AxiosError) => {
        hideLoading();

        console.error('❌ 响应错误:', error);

        let errorMessage = '网络错误';

        if (error.response) {
            // 服务器响应错误
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    errorMessage = '请求参数错误';
                    break;
                case 401:
                    errorMessage = '未授权，请重新登录';
                    localStorage.removeItem('token');
                    break;
                case 403:
                    errorMessage = '权限不足';
                    break;
                case 404:
                    errorMessage = '请求的资源不存在';
                    break;
                case 500:
                    errorMessage = '服务器内部错误';
                    break;
                default:
                    errorMessage = (data as any)?.message || `请求失败 (${status})`;
            }
        } else if (error.request) {
            // 网络错误
            errorMessage = '网络连接失败，请检查网络';
        } else {
            errorMessage = error.message || '未知错误';
        }

        // 显示错误消息
        const config = error.config as CustomRequestConfig;
        if (config?.showErrorMessage !== false) {
            ElMessage.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

// 封装常用请求方法
export const http = {
    // GET请求
    get<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
        return request.get(url, config);
    },

    // POST请求
    post<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
        return request.post(url, data, config);
    },

    // PUT请求
    put<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
        return request.put(url, data, config);
    },

    // DELETE请求
    delete<T = any>(url: string, config?: CustomRequestConfig): Promise<T> {
        return request.delete(url, config);
    },

    // PATCH请求
    patch<T = any>(url: string, data?: any, config?: CustomRequestConfig): Promise<T> {
        return request.patch(url, data, config);
    },
};

// 默认导出
export default request;
