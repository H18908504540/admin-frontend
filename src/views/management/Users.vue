<template>
    <div class="users-container">
        <el-card class="box-card">
            <template #header>
                <span>用户管理</span>
            </template>

            <div class="toolbar">
                <el-input v-model="searchQuery" placeholder="按用户名或邮箱搜索" class="search-input " clearable
                    @clear="handleSearch" @keyup.enter="handleSearch">
                    <template #append>
                        <el-button :icon="Search" @click="handleSearch"></el-button>
                    </template>
                </el-input>
                <el-button type="primary" :icon="Plus" @click="handleAddUser">添加用户</el-button>
            </div>

            <el-table :data="paginatedUsers" stripe style="width: 100%;" v-loading="loading">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="username" label="用户名" width="180" />
                <el-table-column prop="email" label="邮箱" width="220" />
                <el-table-column prop="role" label="角色" width="120" />
                <el-table-column prop="createdAt" label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.createdAt) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" width="180">
                    <template #default="scope">
                        <el-button size="small" type="primary" :icon="Edit"
                            @click="handleEditUser(scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" :icon="Delete"
                            @click="handleDeleteUser(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination-container" :current-page="currentPage" :page-size="pageSize"
                :total="filteredUsers.length" layout="total, sizes, prev, pager, next, jumper"
                :page-sizes="pageSizes" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </el-card>

        <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" :before-close="handleCloseDialog" destroy-on-close>
            <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="80px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="userForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="密码" prop="password" v-if="!userForm.id">
                    <el-input type="password" v-model="userForm.password" placeholder="请输入密码" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="password" v-else>
                    <el-input type="password" v-model="userForm.newPassword" placeholder="当前版本暂不支持密码修改" show-password disabled />
                    <div style="font-size: 12px; color: #909399; margin-top: 4px;">
                        注：当前版本暂不支持通过此界面修改密码
                    </div>
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="userForm.role" placeholder="请选择角色">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="user"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleCloseDialog" :disabled="loading">取消</el-button>
                    <el-button type="primary" @click="handleSaveUser" :loading="loading">
                        {{ loading ? '保存中...' : '确定' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>


<script lang="ts" setup>
import { computed, nextTick, reactive, ref, onMounted } from 'vue';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { getUserList, addUser, deleteUser, updateUser, type User as ApiUser, type CreateUserRequest, type UpdateUserRequest } from '../../api/user';

// 扩展API用户类型，添加表单需要的字段
interface User extends ApiUser {
    password?: string; // 仅用于创建或重置
    newPassword?: string; // 仅用于编辑时修改密码
}

// 用户数据（等待接口数据）
const allUsers = ref<User[]>([]); // 保存所有用户数据，用于搜索和分页

// 方法：获取用户列表
const fetchUsers = async () => {
    loading.value = true;
    try {
        const users = await getUserList();
        allUsers.value = users.users;
    } catch (error) {
        console.error('获取用户列表失败:', error);
        ElMessage.error('获取用户列表失败');
        
        // 设置假数据以便正常显示
        allUsers.value = [
            {
                id: 'mock-user-1',
                username: 'admin',
                email: 'admin@example.com',
                role: 'admin',
                createdAt: '2024-01-01T10:00:00.000Z'
            },
            {
                id: 'mock-user-2',
                username: 'testuser',
                email: 'test@example.com',
                role: 'user',
                createdAt: '2024-01-02T10:00:00.000Z'
            },
            {
                id: 'mock-user-3',
                username: 'demouser',
                email: 'demo@example.com',
                role: 'user',
                createdAt: '2024-01-03T10:00:00.000Z'
            }
        ];
    } finally {
        loading.value = false;
    }
};

// 校验规则
const userFormRules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 15, message: '用户名长度在3到15个字符', trigger: 'blur' },
        { 
            pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, 
            message: '用户名只能包含字母、数字、下划线和中文', 
            trigger: 'blur' 
        },
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'change'] },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在6到20位之间', trigger: 'blur' },
        { 
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]*$/, 
            message: '密码必须包含至少一个字母和一个数字', 
            trigger: 'blur' 
        },
    ],
    newPassword: [
        { min: 6, max: 20, message: '新密码长度在6到20位之间', trigger: 'blur' },
        { 
            pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]*$/, 
            message: '密码必须包含至少一个字母和一个数字', 
            trigger: 'blur' 
        },
    ],
    role: [{ required: true, message: '请选择用户角色', trigger: 'change' }]
});

const pageSizes = [5, 10, 20, 50];

// 用户列表加载状态
const loading = ref<boolean>(false);

// 搜索状态
const searchQuery = ref<string>('');

// 分页状态
const currentPage = ref<number>(1);
const pageSize = ref<number>(5);

// 对话框状态
const dialogTitle = ref<string>('');
const dialogVisible = ref<boolean>(false);
const userFormRef = ref<FormInstance>();
const userForm = reactive<Partial<User>>({
    id: undefined,
    username: '',
    email: '',
    password: '',
    newPassword: '',
    role: 'user',
});


// 过滤后的用户
const filteredUsers = computed(() => {
    if (!searchQuery.value) {
        return allUsers.value;
    }
    return allUsers.value.filter(user =>
        user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

// 当前页显示的用户
const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredUsers.value.slice(start, end);
});


// 方法：关键字查询
const handleSearch = async () => {
    currentPage.value = 1;
    // TODO: 如果需要服务端搜索，在这里调用搜索接口
    // await fetchUsers(searchQuery.value);
    
    // 当前使用客户端过滤，通过 computed 属性 filteredUsers 实现
};

// 方法：添加用户
const handleAddUser = () => {
    dialogTitle.value = '添加用户';

    Object.assign(userForm, { //重置表单
        id: undefined,
        username: '',
        email: '',
        password: '',
        newPassword: '',
        role: 'user',
    });

// 移除新密码字段的验证规则（如果存在），并确保密码字段验证规则存在
  if (userFormRules.newPassword) delete userFormRules.newPassword;
  userFormRules.password = [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ];

    dialogVisible.value = true;
    nextTick(() => {
    // 对全新的表单实例调用 resetFields()
    // 这会用 userForm 当前的值（空值）来初始化表单，并清除所有校验状态。
    userFormRef.value?.resetFields();
  });
};

// 方法：编辑
const handleEditUser = (user: User) => {
    dialogTitle.value = '编辑用户';
    Object.assign(userForm, { ...user, password: '', newPassword: '' }) // 填充表单，密码留空

    // 移除密码字段的验证规则，新密码字段暂时禁用所以也不需要验证
    if (userFormRules.password) delete userFormRules.password;
    if (userFormRules.newPassword) delete userFormRules.newPassword;

    dialogVisible.value = true;
    userFormRef.value?.clearValidate();
};

// 方法：删除
const handleDeleteUser = (userId: string) => {
    ElMessageBox.confirm('确定要删除该用户吗？此操作不可撤销。', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        loading.value = true;
        try {
            console.log('删除用户ID:', userId);
            // 调用删除用户接口
            await deleteUser(userId);
            console.log('用户删除成功');
            
            ElMessage.success('用户删除成功');
            
            // 重新获取用户列表，确保数据同步
            try {
                await fetchUsers();
                console.log('刷新用户列表成功');
                
                // 如果删除后当前页为空，且不是第一页，则跳到上一页
                if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
                    currentPage.value--;
                }
            } catch (refreshError) {
                console.error('刷新用户列表失败:', refreshError);
                // 如果刷新失败，手动从本地数组删除（备选方案）
                allUsers.value = allUsers.value.filter(user => user.id !== userId);
                
                // 如果删除后当前页为空，且不是第一页，则跳到上一页
                if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
                    currentPage.value--;
                }
            }
        } catch (error: any) {
            console.error('删除用户失败:', error);
            console.error('错误响应:', error.response);
            
            // 根据错误类型显示不同的错误信息
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.response.data?.error || '';
                
                if (status === 404) {
                    ElMessage.error('用户不存在或已被删除');
                } else if (status === 403) {
                    ElMessage.error('权限不足，无法删除此用户');
                } else if (status === 409) {
                    ElMessage.error(`无法删除用户: ${message}`);
                } else if (status === 500) {
                    ElMessage.error(`服务器错误: ${message}`);
                } else {
                    ElMessage.error(`删除失败 (${status}): ${message}`);
                }
            } else if (error.request) {
                ElMessage.error('网络连接失败，请检查网络或后端服务');
            } else {
                ElMessage.error(`删除请求配置错误: ${error.message}`);
            }
        } finally {
            loading.value = false;
        }
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

// 方法：保存用户（添加或编辑）
const handleSaveUser = async () => {
    if (!userFormRef.value) return;
    
    await userFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                if (userForm.id) { 
                    // 调用编辑用户接口
                    const updateData: UpdateUserRequest = {
                        username: userForm.username,
                        email: userForm.email,
                        role: userForm.role as 'admin' | 'user',
                    };
                    
                    try {
                        console.log('发送更新用户数据:', updateData, '用户ID:', userForm.id);
                        const updatedUser = await updateUser(userForm.id, updateData);
                        console.log('更新用户成功:', updatedUser);
                        
                        ElMessage.success('用户更新成功');
                        dialogVisible.value = false;
                        
                        // 重新获取用户列表，确保数据同步
                        try {
                            await fetchUsers();
                            console.log('刷新用户列表成功');
                        } catch (refreshError) {
                            console.error('刷新用户列表失败:', refreshError);
                            // 如果刷新失败，手动更新本地数组（备选方案）
                            const index = allUsers.value.findIndex(u => u.id === userForm.id);
                            if (index !== -1) {
                                allUsers.value[index] = updatedUser;
                            }
                        }
                    } catch (error: any) {
                        console.error('更新用户失败:', error);
                        console.error('错误响应:', error.response);
                        
                        // 根据错误类型显示不同的错误信息
                        if (error.response) {
                            const status = error.response.status;
                            const message = error.response.data?.message || error.response.data?.error || '';
                            
                            if (status === 404) {
                                ElMessage.error('用户不存在或已被删除');
                            } else if (status === 409) {
                                ElMessage.error(`用户名或邮箱已存在: ${message}`);
                            } else if (status === 400) {
                                ElMessage.error(`输入数据不合法: ${message}`);
                            } else if (status === 403) {
                                ElMessage.error('权限不足，无法修改此用户');
                            } else if (status === 500) {
                                ElMessage.error(`服务器错误: ${message}`);
                            } else {
                                ElMessage.error(`更新失败 (${status}): ${message}`);
                            }
                        } else if (error.request) {
                            ElMessage.error('网络连接失败，请检查网络或后端服务');
                        } else {
                            ElMessage.error(`请求配置错误: ${error.message}`);
                        }
                        return; // 出错时不关闭对话框
                    }
                } else { 
                    // 调用创建用户接口
                    const newUserData: CreateUserRequest = {
                        username: userForm.username!,
                        email: userForm.email!,
                        role: userForm.role! as 'admin' | 'user',
                        password: userForm.password!,
                    };
                    
                    try {
                        console.log('发送用户数据:', newUserData);
                        const createdUser = await addUser(newUserData);
                        console.log('创建用户成功:', createdUser);
                        console.log('当前用户列表长度:', allUsers.value.length);
                        
                        ElMessage.success('用户添加成功');
                        dialogVisible.value = false;
                        
                        // 重新获取用户列表，确保数据同步
                        try {
                            await fetchUsers();
                            console.log('刷新后用户列表长度:', allUsers.value.length);
                            // 重置分页到第一页以显示新添加的用户
                            currentPage.value = 1;
                        } catch (refreshError) {
                            console.error('刷新用户列表失败:', refreshError);
                            // 如果刷新失败，手动添加到列表（备选方案）
                            allUsers.value.unshift(createdUser);
                            currentPage.value = 1;
                        }
                    } catch (error: any) {
                        console.error('添加用户失败:', error);
                        console.error('错误响应:', error.response);
                        console.error('错误请求:', error.request);
                        
                        // 根据错误类型显示不同的错误信息
                        if (error.response) {
                            const status = error.response.status;
                            const message = error.response.data?.message || error.response.data?.error || '';
                            
                            if (status === 409) {
                                ElMessage.error(`用户名或邮箱已存在: ${message}`);
                            } else if (status === 400) {
                                ElMessage.error(`输入数据不合法: ${message}`);
                            } else if (status === 500) {
                                ElMessage.error(`服务器错误: ${message}`);
                            } else {
                                ElMessage.error(`请求失败 (${status}): ${message}`);
                            }
                        } else if (error.request) {
                            ElMessage.error('网络连接失败，请检查网络或后端服务');
                        } else {
                            ElMessage.error(`请求配置错误: ${error.message}`);
                        }
                        return; // 出错时不关闭对话框
                    }
                }
            } catch (error) {
                console.error('保存用户失败:', error);
                if (userForm.id) {
                    ElMessage.error('用户更新失败');
                }
                // 注意：新增用户的错误处理已在上面的 addUser 调用中处理
            } finally {
                loading.value = false;
            }
        } else {
            ElMessage.error('请检查表单输入项');
        }
    });
};

// 方法：处理分页大小改变
const handleSizeChange = (val: number) => {
    pageSize.value = val;
    currentPage.value = 1 // 页面大小改变时回到第一页
}

// 方法：处理当前页改变
const handleCurrentChange = (val: number) => {
    currentPage.value = val;
}

// 方法： 格式化日期
const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// 方法：处理对话框关闭
const handleCloseDialog = () => {
    dialogVisible.value = false;
    userFormRef.value?.resetFields(); // 重置表单及其校验状态
}

// 组件挂载时获取用户列表
onMounted(() => {
    fetchUsers();
});

</script>

<style lang="less" scoped>
.users-container {
    .box-card {
        .toolbar {
            display: flex;
            justify-content: space-between;

            .search-input {
                width: 200px;
            }
        }
    }
}
</style>