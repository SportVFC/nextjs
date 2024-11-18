// Importation d'un composant personnalisé
import SideNav from '@/app/ui/dashboard/sidenav';

// Déclaration du composant Layout
/**
 * The <Layout /> component receives a children prop. This child can either be a page or another layout.
 * In your case, the pages inside /dashboard will automatically be nested inside a <Layout />
 * 
 * Layout : Une fonction composant React exportée par défaut.
 * 
 * { children } : Le composant reçoit une prop children, qui correspond à
 * tout le contenu enfant inséré dans ce composant lorsqu'il est utilisé dans un
 * autre fichier
 * 
 * { children: React.ReactNode } : Typage TypeScript pour indiquer que
 * children est un nœud React valide
 */
export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // Structure HTML avec TailwindCSS 
        // md:flex-row : En mode medium ou supérieur (md), les enfants passent en mode ligne (side-by-side).
        // md:overflow-hidden : Cache le débordement dans l'axe principal en mode medium ou supérieur
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">

            { /* Sidebar (barre de navigation latérale) :*/ }
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>

            { /* Inclusion du composant de navigation latérale */ }
            { /* {children} : Le contenu principal est inséré ici grâce à la prop children. */ }
            <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
    );
  }