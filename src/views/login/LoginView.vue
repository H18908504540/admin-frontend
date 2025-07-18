<script setup lang="ts">
import { ref, reactive } from 'vue'
// import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import router from '../../router';

// const router = useRouter();
const loginFormRef = ref<FormInstance>();
const loginLoading = ref(false);


const loginForm = reactive({
    username: '',
    password: '',
})

//校验规则定义
const loginRules = reactive<FormRules>({
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    ],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate((valid) => {
    if (valid) {
      loginLoading.value = true;
      console.log('Login data:', loginForm);
      setTimeout(() => {
        // 模拟登录成功
        localStorage.setItem('authToken', 'your-mock-auth-token'); // 存储模拟 token
        ElMessage.success('登录成功');
        router.push('/admin/dashboard'); // 跳转到仪表盘
        loginLoading.value = false;
      }, 1000);
    } else {
      ElMessage.error('请检查输入项');
      return;
    }
  });
};

</script>

<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="card-header">
                    <span>用户登录</span>
                </div>
            </template>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px" class="login-form"
                @submit.prevent="handleLogin">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名或邮箱"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input type="password" v-model="loginForm.password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item class="login-button">
                    <el-button type="primary" native-type="submit" :loading="loginLoading">登录</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<style lang="less" scoped>

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: @background-color;

    .login-card {
        width: 400px;

        .card-header {
            text-align: center;
            font-size: 20px;
        }

        .login-form {
            margin-top: 20px;
            .login-button {
                text-align: center;
                width: 100%;
                .el-button {
                    display: inline-block;
                    margin: 0 20%;
                }
            }
        }
    }
}
</style>