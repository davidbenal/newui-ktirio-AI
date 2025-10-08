import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { useProjects } from "@/hooks/useProjects";
import { useState } from "react";
import Gallery from "./Gallery";

/**
 * Connected Gallery component that integrates with Firebase
 * This wraps the original Gallery component with real data
 */
export default function GalleryConnected(props: any) {
  const { user, loading: userLoading } = useFirebaseUser();
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

  const handleCreateNewProject = async (shouldOpenUpload = false) => {
    console.log('🟢 GalleryConnected.handleCreateNewProject called with shouldOpenUpload:', shouldOpenUpload);
    console.log('🟢 user:', user);
    console.log('🟢 projects.length:', projects.length);

    if (!user) {
      console.error('❌ No user found, returning early');
      return;
    }

    // TODO: Re-enable project limits for free users in production
    // For now, allow unlimited projects during development
    // if (user && user.plan === "free" && projects.length >= 5) {
    //   console.log('⚠️ Free user project limit reached, opening upgrade modal');
    //   if (props.onUpgradeModalChange) {
    //     props.onUpgradeModalChange(true);
    //   }
    //   return;
    // }

    try {
      console.log('🟢 Calling createProject...');
      const projectId = await createProject(`Novo Projeto ${projects.length + 1}`);
      console.log('🟢 Project created with ID:', projectId);

      if (props.onCreateNewProject) {
        console.log('🟢 Calling props.onCreateNewProject with shouldOpenUpload:', shouldOpenUpload);
        props.onCreateNewProject(shouldOpenUpload); // Pass the parameter
      } else {
        console.error('❌ props.onCreateNewProject is not defined!');
      }
    } catch (error) {
      console.error("❌ Error creating project:", error);
      // Mesmo com erro, navegar pro editor se tiver user
      if (user && props.onCreateNewProject) {
        console.log('⚠️ Error creating project in Firestore, but navigating to editor anyway');
        props.onCreateNewProject(shouldOpenUpload);
      }
    }
  };

  // Convert Firebase projects to Gallery format, or use local projects if Firebase is empty
  const mockProjects = projects.length > 0
    ? projects.map((p) => ({
        id: p.id,
        name: p.name,
        date: p.updatedAt instanceof Date
          ? p.updatedAt.toLocaleDateString("pt-BR")
          : new Date(p.updatedAt).toLocaleDateString("pt-BR"),
        thumbnail: p.thumbnail,
      }))
    : props.localProjects || [];

  console.log('🔵 GalleryConnected - mockProjects:', mockProjects);
  console.log('🔵 Firebase projects:', projects.length, 'Local projects:', props.localProjects?.length || 0);

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
    <div className="relative h-full">
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
