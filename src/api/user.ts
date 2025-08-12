import { http } from '../utils/request';

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

// 获取用户列表的请求参数类型
export interface GetUserListParams {
    page?: number;
    limit?: number;
    keyword?: string;
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
    searchKeyword?: string;
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

// 获取用户列表（支持分页和搜索）
export const getUserList = async (params?: GetUserListParams): Promise<{
    users: User[];
    pagination: {
        current: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    searchKeyword?: string;
}> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    
    const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await http.get<{ data: UserListResponse }>(url);
    
    return {
        users: response.data.data.map(transformUser),
        pagination: response.data.pagination,
        searchKeyword: response.data.searchKeyword
    };
};

// 创建用户的请求数据类型
export interface CreateUserRequest {
    username: string;
    email: string;
    role: 'admin' | 'user';
    password: string;
}

// 修改用户的请求数据类型（支持部分更新）
export interface UpdateUserRequest {
    username?: string;
    email?: string;
    role?: 'admin' | 'user';
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

// 修改用户
export const updateUser = async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    const response = await http.put(`/users/${userId}`, userData);
    
    // 处理不同的响应格式
    let userResponse;
    if (response.data) {
        // 响应格式: { data: BackendUser }
        userResponse = response.data;
    } else {
        // 响应格式: BackendUser
        userResponse = response;
    }
    
    // 转换后端数据格式为前端格式
    return transformUser(userResponse);
};

// 删除用户
export const deleteUser = async (userId: string): Promise<void> => {
    await http.delete(`/users/${userId}`);
};
