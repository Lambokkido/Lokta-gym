import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    title: 'Musculación',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
  },
  {
    title: 'Powerlifting',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
  },
  {
    title: 'Funcional',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <main>

      {/* Hero */}
      <section
        className="relative flex items-center justify-center min-h-[calc(100vh-64px)] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600&q=80')" }}
      >
        {/* Overlay oscuro */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Contenido centrado */}
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-widest uppercase mb-8">
            Lokta <span className="text-emerald-400">Gym</span>
          </h1>
          <Link
            to={user ? '/exercises' : '/register'}
            className="inline-block border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-3 text-lg font-semibold tracking-wide transition-colors"
          >
            {user ? 'Ir al catálogo' : 'Empezar ahora'}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black uppercase mb-3">Lo que encontrás</h2>
          <div className="w-16 h-1 bg-emerald-400 mx-auto mb-4" />
          <p className="text-gray-400">Todo lo que necesitás para entrenar mejor, en un solo lugar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-xl h-72 cursor-pointer">
              {/* Imagen */}
              <img
                src={f.image}
                alt={f.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay oscuro que aparece al hacer hover */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                <h3 className="text-white text-2xl font-black uppercase tracking-widest">
                  {f.title}
                </h3>
                <div className="w-8 h-0.5 bg-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
