import request, { http } from '../utils/request';

// 后端用户数据格式
interface BackendUser {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    createdAt: string;
    updatedAt: string;
    __v: number;
}

// 前端用户接口类型定义（保持原有格式）
export interface User {
    id: string; // 映射自后端的 _id
    username: string;
    email: string;
    role: 'admin' | 'user';
    password?: string;
    createdAt: string;
}

// 后端响应格式
interface UserListResponse {
    data: BackendUser[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// 数据转换函数：后端格式转前端格式
const transformUser = (backendUser: BackendUser): User => {
    return {
        id: backendUser._id,
        username: backendUser.username,
        email: backendUser.email,
        role: backendUser.role,
        createdAt: backendUser.createdAt,
    };
};

// 获取用户列表
export const getUserList = async (): Promise<User[]> => {
    const response = await http.get<{ data: UserListResponse }>('/users');
    // 转换后端数据格式为前端格式
    return response.data.data.map(transformUser);
};

// 创建用户的请求数据类型
export interface CreateUserRequest {
    username: string;
    email: string;
    role: 'admin' | 'user';
    password: string;
}

// 添加用户
export const addUser = async (user: CreateUserRequest): Promise<User> => {
    const response = await http.post('/users', user);
    
    // 处理不同的响应格式
    let userData;
    if (response.data) {
        // 响应格式: { data: BackendUser }
        userData = response.data;
    } else {
        // 响应格式: BackendUser
        userData = response;
    }
    
    // 转换后端数据格式为前端格式
    return transformUser(userData);
};

// 删除用户
export const deleteUser = async (userId: string): Promise<void> => {
    await http.delete(`/users/${userId}`);
};
