export function MainNav() {
  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Entrevistas', path: '/entrevistas' },
    // ... otros items del menú ...
  ];

  return (
    <nav>
      <ul className="flex items-center gap-6">
        {menuItems.map(item => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
} 