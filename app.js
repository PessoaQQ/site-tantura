// app.js

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const newsContainer = document.getElementById('news-container');
    const gameImage = document.getElementById('game-image');
    const gameVersion = document.getElementById('game-version');
    const downloadButton = document.getElementById('download-button');
    const downloadLoading = document.getElementById('download-loading');

    // Função para buscar e renderizar notícias
    const fetchAndRenderNews = async () => {
        newsContainer.innerHTML = '<p>Carregando notícias...</p>'; // Mensagem de carregamento
        try {
            const snapshot = await db.collection('noticias')
                                     .orderBy('timestamp', 'desc') // Ordena pelas mais recentes
                                     .get();

            newsContainer.innerHTML = ''; // Limpa a mensagem de carregamento

            if (snapshot.empty) {
                newsContainer.innerHTML = '<p>Nenhuma notícia encontrada no momento.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const news = doc.data();
                const newsItem = document.createElement('div');
                newsItem.classList.add('news-item');

                // Formatar a data
                const date = news.timestamp ? news.timestamp.toDate().toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Data desconhecida';

                newsItem.innerHTML = `
                    <h3>${news.title}</h3>
                    <span class="news-meta">Publicado em: ${date}</span>
                    ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.title}">` : ''}
                    <p>${news.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}</p>
                    ${news.videoUrl ? `<iframe src="${news.videoUrl.replace("watch?v=", "embed/")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : ''}
                `;
                newsContainer.appendChild(newsItem);
            });
        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            newsContainer.innerHTML = '<p style="color: red;">Erro ao carregar notícias. Tente novamente mais tarde.</p>';
        }
    };

    // Função para buscar e renderizar informações de download
    const fetchAndRenderDownloadInfo = async () => {
        try {
            const doc = await db.collection('download').doc('info').get();

            if (doc.exists) {
                const data = doc.data();
                gameImage.src = data.imageUrl;
                gameImage.alt = `Imagem do Jogo - ${data.versionText}`;
                gameImage.style.display = 'block'; // Mostra a imagem
                gameVersion.textContent = data.versionText;
                downloadButton.href = data.downloadUrl;
                downloadButton.style.display = 'inline-block'; // Mostra o botão
                downloadLoading.style.display = 'none'; // Esconde a mensagem de carregamento
            } else {
                gameVersion.textContent = 'Informações de download não disponíveis.';
                downloadLoading.textContent = 'Nenhuma informação de download configurada.';
                console.log('Nenhum documento "info" encontrado na coleção "download".');
            }
        } catch (error) {
            console.error('Erro ao buscar informações de download:', error);
            downloadLoading.textContent = 'Erro ao carregar informações de download. Tente novamente mais tarde.';
            downloadLoading.style.color = 'red';
        }
    };

    // Chamar as funções ao carregar a página
    fetchAndRenderNews();
    fetchAndRenderDownloadInfo();
});