// admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Elementos da tela de login
    const loginScreen = document.getElementById('login-screen');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // Elementos do painel de administração
    const adminPanel = document.getElementById('admin-panel');
    const logoutButton = document.getElementById('logout-button');

    // Elementos do formulário de notícias
    const newsForm = document.getElementById('news-form');
    const newsTitleInput = document.getElementById('news-title');
    const newsContentInput = document.getElementById('news-content');
    const newsImageUrlInput = document.getElementById('news-image-url');
    const newsVideoUrlInput = document.getElementById('news-video-url');
    const newsStatus = document.getElementById('news-status');

    // Elementos do formulário de download
    const downloadForm = document.getElementById('download-form');
    const gameImageUrlInput = document.getElementById('game-image-url');
    const gameVersionTextInput = document.getElementById('game-version-text');
    const downloadLinkUrlInput = document.getElementById('download-link-url');
    const downloadStatus = document.getElementById('download-status');

    // Lógica de Autenticação do Firebase
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário logado
            loginScreen.style.display = 'none';
            adminPanel.style.display = 'block';
            logoutButton.style.display = 'block';
            loginError.style.display = 'none';

            // Pré-popular formulário de download com dados atuais
            loadDownloadInfoForAdmin();
        } else {
            // Usuário deslogado
            loginScreen.style.display = 'block';
            adminPanel.style.display = 'none';
            logoutButton.style.display = 'none';
            // Limpa os campos de login ao deslogar
            emailInput.value = '';
            passwordInput.value = '';
        }
    });

    // Lógica de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Redirecionamento ou atualização de UI será tratado por onAuthStateChanged
        } catch (error) {
            console.error('Erro de login:', error);
            loginError.textContent = 'Email ou senha incorretos.';
            loginError.style.display = 'block';
        }
    });

    // Lógica de Logout
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            // Redirecionamento ou atualização de UI será tratado por onAuthStateChanged
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    });

    // Lógica para Postar Notícia
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        newsStatus.style.display = 'block';
        newsStatus.style.color = 'var(--primary-color)';
        newsStatus.textContent = 'Publicando notícia...';

        const title = newsTitleInput.value;
        const content = newsContentInput.value;
        const imageUrl = newsImageUrlInput.value;
        const videoUrl = newsVideoUrlInput.value;

        if (!title || !content) {
            newsStatus.textContent = 'Título e conteúdo são obrigatórios!';
            newsStatus.style.color = 'red';
            return;
        }

        try {
            await db.collection('noticias').add({
                title,
                content,
                imageUrl,
                videoUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            newsStatus.textContent = 'Notícia publicada com sucesso!';
            newsStatus.style.color = 'green';
            newsForm.reset(); // Limpa o formulário
        } catch (error) {
            console.error('Erro ao postar notícia:', error);
            newsStatus.textContent = `Erro ao publicar notícia: ${error.message}`;
            newsStatus.style.color = 'red';
        } finally {
            setTimeout(() => { newsStatus.style.display = 'none'; }, 5000); // Esconde a mensagem após 5 segundos
        }
    });

    // Lógica para Atualizar Informações de Download
    downloadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        downloadStatus.style.display = 'block';
        downloadStatus.style.color = 'var(--primary-color)';
        downloadStatus.textContent = 'Salvando alterações...';

        const imageUrl = gameImageUrlInput.value;
        const versionText = gameVersionTextInput.value;
        const downloadUrl = downloadLinkUrlInput.value;

        if (!imageUrl || !versionText || !downloadUrl) {
            downloadStatus.textContent = 'Todos os campos de download são obrigatórios!';
            downloadStatus.style.color = 'red';
            return;
        }

        try {
            // O documento 'info' será criado se não existir
            await db.collection('download').doc('info').set({
                imageUrl,
                versionText,
                downloadUrl,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            downloadStatus.textContent = 'Informações de download atualizadas com sucesso!';
            downloadStatus.style.color = 'green';
        } catch (error) {
            console.error('Erro ao atualizar download:', error);
            downloadStatus.textContent = `Erro ao atualizar download: ${error.message}`;
            downloadStatus.style.color = 'red';
        } finally {
            setTimeout(() => { downloadStatus.style.display = 'none'; }, 5000); // Esconde a mensagem após 5 segundos
        }
    });

    // Função para carregar as informações atuais de download no formulário de admin
    const loadDownloadInfoForAdmin = async () => {
        try {
            const doc = await db.collection('download').doc('info').get();
            if (doc.exists) {
                const data = doc.data();
                gameImageUrlInput.value = data.imageUrl || '';
                gameVersionTextInput.value = data.versionText || '';
                downloadLinkUrlInput.value = data.downloadUrl || '';
            }
        } catch (error) {
            console.error('Erro ao carregar info de download para o admin:', error);
        }
    };
});