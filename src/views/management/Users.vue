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
                    <el-input type="password" v-model="userForm.newPassword" placeholder="留空则不修改密码" show-password />
                </el-form-item>
                <el-form-item label="角色" prop="role">
                    <el-select v-model="userForm.role" placeholder="请选择角色">
                        <el-option label="管理员" value="admin"></el-option>
                        <el-option label="普通用户" value="user"></el-option>
                        <el-option label="访客" value="guest"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleCloseDialog">取消</el-button>
                    <el-button type="primary" @click="handleSaveUser">确定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>


<script lang="ts" setup>
import { computed, nextTick, reactive, ref } from 'vue';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';

// 定义用户接口ts
interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
    password?: string; // 仅用于创建或重置
    newPassword?: string; // 仅用于编辑时修改密码
    createdAt: string;
};

// 模拟用户数据
const mockUsers: User[] = reactive([
    { id: 1, username: 'admin_user', email: 'admin@example.com', role: 'admin', createdAt: new Date(2023, 0, 15).toISOString() },
    { id: 2, username: 'john_doe', email: 'john.doe@example.com', role: 'user', createdAt: new Date(2023, 1, 20).toISOString() },
    { id: 3, username: 'jane_smith', email: 'jane.smith@example.com', role: 'user', createdAt: new Date(2023, 2, 10).toISOString() },
    { id: 4, username: 'guest_visitor', email: 'guest@example.com', role: 'guest', createdAt: new Date(2023, 3, 5).toISOString() },
    { id: 5, username: 'editor_person', email: 'editor@example.com', role: 'user', createdAt: new Date(2023, 4, 1).toISOString() },
    { id: 6, username: 'test_user_1', email: 'test1@example.com', role: 'user', createdAt: new Date(2024, 0, 1).toISOString() },
    { id: 7, username: 'test_user_2', email: 'test2@example.com', role: 'admin', createdAt: new Date(2024, 1, 5).toISOString() },
    { id: 8, username: 'another_guest', email: 'guest2@example.com', role: 'guest', createdAt: new Date(2024, 2, 10).toISOString() },
    { id: 9, username: 'super_editor', email: 'superedit@example.com', role: 'user', createdAt: new Date(2024, 3, 15).toISOString() },
    { id: 10, username: 'final_user', email: 'final@example.com', role: 'user', createdAt: new Date(2024, 4, 20).toISOString() },
])

const allUsers = ref<User[]>([...mockUsers]); //保存所有用户数据，用于搜索和分页

// 校验规则
const userFormRules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 15, message: '长度在3到15个字符', trigger: 'blur' },
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '邮箱格式错误', trigger: ['blur', 'change'] },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    ],
    newPassword: [
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
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
const handleSearch = () => {
    currentPage.value = 1;
    // 实际数据获取逻辑通过 computed 属性 filteredUsers 实现
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

    // 移除密码字段的验证规则，并添加新密码字段的验证规则
    if (userFormRules.password) delete userFormRules.password;
    userFormRules.newPassword = [
        { min: 6, message: '新密码长度不能少于6位', trigger: 'blur' },
    ];

    dialogVisible.value = true;
    userFormRef.value?.clearValidate();
};

// 方法：删除
const handleDeleteUser = (userId: number) => {
    ElMessageBox.confirm('确定要删除该用户吗？此操作不可撤销。', '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        // 点击确认删除的逻辑
        loading.value = true;
        setTimeout(() => {
            allUsers.value = allUsers.value.filter(user => user.id !== userId); //allUsers数组中过滤掉目标用户
            ElMessage.success('用户删除成功');
            loading.value = false;
            if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
                currentPage.value--; // 如果删除后当前页为空，且不是第一页，则跳到上一页
            }
        }, 500);
    }).catch(() => {
        ElMessage.info('已取消删除');
    });
};

// 方法：保存用户（添加或编辑）
const handleSaveUser = async () => {
    if (!userFormRef.value) return;
    await userFormRef.value.validate((valid) => {
        if (valid) {
            loading.value = true; // 模拟 API 请求
            setTimeout(() => {
                if (userForm.id) { // 编辑模式
                    const index = allUsers.value.findIndex(u => u.id === userForm.id);
                    if (index !== -1) {
                        const updatedUser = { ...allUsers.value[index], ...userForm };
                        if (userForm.newPassword) { // 如果输入了新密码
                            updatedUser.password = userForm.newPassword; // 实际应用中这里是哈希后的密码
                        }
                        allUsers.value[index] = { ...updatedUser, newPassword: '' }; // 保存时移除 newPassword
                        ElMessage.success('用户更新成功');
                    }
                } else { // 添加模式
                    const newUser: User = {
                        id: Math.max(0, ...allUsers.value.map(u => u.id)) + 1, // 简单生成 ID
                        username: userForm.username!,
                        email: userForm.email!,
                        role: userForm.role!,
                        password: userForm.password!, // 实际应用中这里是哈希后的密码
                        createdAt: new Date().toISOString(),
                    };
                    allUsers.value.unshift(newUser); // 添加到列表开头
                    ElMessage.success('用户添加成功');
                }
                loading.value = false;
                dialogVisible.value = false;
            }, 500);
        } else {
            ElMessage.error('请检查表单输入项');
            return;
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