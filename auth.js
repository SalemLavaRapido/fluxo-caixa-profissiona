// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar se já existe um usuário logado
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainApp();
        }
    }

    // Login
    async login(email, password) {
        try {
            if (!isSupabaseConfigured()) {
                showConfigAlert();
                return false;
            }

            this.showLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                this.currentUser = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.name || data.user.email.split('@')[0]
                };

                // Salvar no localStorage
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                this.showMainApp();
                this.showAlert('Login realizado com sucesso!', 'success');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro no login:', error);
            this.showAlert('Erro ao fazer login: ' + error.message, 'danger');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    // Registro
    async register(name, email, password, confirmPassword) {
        try {
            if (!isSupabaseConfigured()) {
                showConfigAlert();
                return false;
            }

            if (password !== confirmPassword) {
                this.showAlert('As senhas não coincidem!', 'danger');
                return false;
            }

            if (password.length < 6) {
                this.showAlert('A senha deve ter pelo menos 6 caracteres!', 'danger');
                return false;
            }

            this.showLoading(true);

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name
                    }
                }
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                this.showAlert('Cadastro realizado com sucesso! Verifique seu email para confirmar.', 'success');
                
                // Limpar formulário
                document.getElementById('registerForm').reset();
                
                // Mostrar login após 2 segundos
                setTimeout(() => {
                    this.showLoginForm();
                }, 2000);
                
                return true;
            }

            return false;
        } catch (error) {
            console.error('Erro no registro:', error);
            this.showAlert('Erro ao cadastrar: ' + error.message, 'danger');
            return false;
        } finally {
            this.showLoading(false);
        }
    }

    // Logout
    async logout() {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }

            // Limpar dados
            this.currentUser = null;
            localStorage.removeItem('currentUser');

            // Mostrar tela de login
            this.showLoginScreen();
            this.showAlert('Logout realizado com sucesso!', 'info');
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }

    // Mostrar tela principal
    showMainApp() {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        // Atualizar informações do usuário
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('userEmail').textContent = this.currentUser.email;
        }
    }

    // Mostrar tela de login
    showLoginScreen() {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    // Mostrar formulário de login
    showLoginForm() {
        document.getElementById('loginContainer').classList.remove('hidden');
        document.getElementById('registerContainer').classList.add('hidden');
    }

    // Mostrar formulário de registro
    showRegisterForm() {
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('registerContainer').classList.remove('hidden');
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            if (show) {
                spinner.classList.add('show');
            } else {
                spinner.classList.remove('show');
            }
        }
    }

    // Mostrar alerta
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            const alertId = 'alert-' + Date.now();
            const alertHtml = `
                <div id="${alertId}" class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
                    <i class="fas fa-${this.getAlertIcon(type)} me-2"></i>
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `;
            
            alertContainer.insertAdjacentHTML('beforeend', alertHtml);

            // Auto remover após 5 segundos
            setTimeout(() => {
                const alert = document.getElementById(alertId);
                if (alert) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    // Obter ícone do alerta
    getAlertIcon(type) {
        const icons = {
            'success': 'check-circle',
            'danger': 'exclamation-triangle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obter ID do usuário atual
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.id : null;
    }
}

// Instância global do sistema de autenticação
const authSystem = new AuthSystem();

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            await authSystem.login(email, password);
        });
    }

    // Formulário de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            await authSystem.register(name, email, password, confirmPassword);
        });
    }
});

// Funções globais para acesso pelo HTML
function showLoginForm() {
    authSystem.showLoginForm();
}

function showRegisterForm() {
    authSystem.showRegisterForm();
}

function logout() {
    authSystem.logout();
}

// Exportar para uso em outros módulos
window.authSystem = authSystem;
