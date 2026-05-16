document.addEventListener('DOMContentLoaded', () => {
    const projectsContainer = document.getElementById('projects-container');
    const username = 'MyCodeChavez';
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar los proyectos');
            }
            return response.json();
        })
        .then(data => {
            // Filtrar repositorios (opcional: quitar forks si se desea)
            const projects = data.filter(repo => !repo.fork); // Mostrar solo proyectos propios si se desea, o todos.
            
            projectsContainer.innerHTML = ''; // Limpiar mensaje de carga

            if (projects.length === 0) {
                projectsContainer.innerHTML = '<p class="text-center">No se encontraron proyectos públicos.</p>';
                return;
            }

            projects.forEach((repo, index) => {
                const card = document.createElement('div');
                card.className = 'project-card';
                card.style.animationDelay = `${index * 0.1}s`; // Stagger animation
                
                // Formatear fecha
                const date = new Date(repo.updated_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                card.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'Sin descripción disponible.'}</p>
                    <div class="project-stats">
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                        <span><i class="fas fa-circle" style="font-size: 0.6rem; color: var(--secondary-color);"></i> ${repo.language || 'Varios'}</span>
                    </div>
                    <div class="project-links">
                        <a href="${repo.html_url}" target="_blank" class="btn-github">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="btn-demo">Demo <i class="fas fa-external-link-alt"></i></a>` : ''}
                    </div>
                    <div style="margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: right;">Actualizado: ${date}</div>
                `;
                
                // Add fade-in animation
                card.style.opacity = '0';
                card.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;
                
                projectsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            projectsContainer.innerHTML = `<p class="error-msg">Hubo un error al cargar los proyectos: ${error.message}</p>`;
        });
});

// Add keyframes for fade-in if not in CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(styleSheet);
