import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";
import Gallery from "./Gallery";
import { UserButton } from "@clerk/clerk-react";

/**
 * Connected Gallery component that integrates with Firebase and Clerk
 * This wraps the original Gallery component with real data
 */
export default function GalleryConnected(props: any) {
  const { user, loading: userLoading, clerkUser } = useFirebaseUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites" | "archived">(
    "all"
  );

  const {
    projects,
    loading: projectsLoading,
    createProject,
    deleteProject,
    toggleFavorite,
  } = useProjects({
    userId: user?.id || null,
    search: searchQuery,
    isFavorite: activeTab === "favorites" ? true : undefined,
    isArchived: activeTab === "archived" ? true : undefined,
  });

  const handleCreateNewProject = async () => {
    if (!user) return;

    // Check project limit for free users
    if (user.plan === "free" && projects.length >= 1) {
      // Open upgrade modal
      if (props.onUpgradeModalChange) {
        props.onUpgradeModalChange(true);
      }
      return;
    }

    try {
      const projectId = await createProject(`Novo Projeto ${projects.length + 1}`);
      if (props.onCreateNewProject) {
        props.onCreateNewProject();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Convert Firebase projects to Gallery format
  const mockProjects = projects.map((p) => ({
    id: p.id,
    name: p.name,
    date: p.updatedAt.toLocaleDateString("pt-BR"),
    thumbnail: p.thumbnail,
  }));

  // Show loading state
  if (userLoading || projectsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F7F8]">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* User button in top-right corner */}
      <div className="absolute right-4 top-4 z-50">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-10 h-10",
              userButtonPopoverCard: "shadow-xl",
              userButtonPopoverActionButton:
                "hover:bg-gray-100 transition-colors",
            },
          }}
        />
      </div>

      <Gallery
        {...props}
        mockProjects={mockProjects}
        onCreateNewProject={handleCreateNewProject}
        userCredits={{
          current: user?.credits || 0,
          max:
            user?.plan === "starter"
              ? 100
              : user?.plan === "professional"
              ? 500
              : 5,
        }}
      />
    </div>
  );
}
