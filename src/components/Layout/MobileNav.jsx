export function MobileNav({ isOpen, onClose }) {
  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Noticias', path: '/noticias' },
    { label: 'Entrevistas', path: '/entrevistas' },
    // ... otros items del menú ...
  ];

  return (
    <motion.div
      // ... resto del código ...
    >
      <nav className="mt-8">
        <ul className="space-y-4">
          {menuItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block py-2 text-lg font-medium transition-colors hover:text-primary ${
                    isActive ? 'text-primary' : 'text-white'
                  }`
                }
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
} 