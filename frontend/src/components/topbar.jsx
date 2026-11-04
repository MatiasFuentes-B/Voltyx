// Componente Topbar de Voltyx
// Recibe por props: 'title' (título de la vista) y 'searchTerm'/'onSearchChange' para el buscador
export default function Topbar({ title, searchTerm, onSearchChange, showSearch }) {
  return (
    <header className="topbar d-flex flex-wrap align-items-center justify-content-between gap-3">
      <h1 id="view-title" className="mb-0">{title}</h1>

      {showSearch && (
        <div className="topbar-search" id="global-search-wrap">
          <input
            type="text"
            className="form-control"
            id="global-search"
            placeholder="Buscar producto por nombre o código…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
    </header>
  );
}