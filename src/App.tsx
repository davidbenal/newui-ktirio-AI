import { useState, useEffect } from 'react';
import GalleryConnected from './components/GalleryConnected';
import Editor from './components/Editor';
import Settings from './components/Settings';
import Pricing from './components/Pricing';
import UpgradeSuccess from './components/UpgradeSuccess';
import UpgradeCanceled from './components/UpgradeCanceled';
import WelcomeScreen from './components/WelcomeScreen';
import FeatureTour from './components/FeatureTour';
import TrialEndedBanner, { BannerVariant } from './components/TrialEndedBanner';
import SoftPaywall, { SoftPaywallVariant } from './components/SoftPaywall';
import BuyCreditsModal from './components/BuyCreditsModal';
import PurchaseSuccessModal from './components/PurchaseSuccessModal';
import { ToastProvider } from './components/ToastProvider';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { AuthProvider, useAuthContext } from './components/AuthProvider';

type ViewType = 'welcome' | 'gallery' | 'editor' | 'settings' | 'pricing' | 'upgrade-success' | 'upgrade-canceled';
type AuthView = 'login' | 'signup';

function AppContent() {
  const { user, loading: authLoading, signInWithGoogle, signUpWithEmail, signOut } = useAuthContext();
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<ViewType>('gallery');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [shouldOpenUpgradeModal, setShouldOpenUpgradeModal] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<'feature' | 'projects' | 'trial' | 'credits'>('credits');
  const [userName, setUserName] = useState<string>('Usuário');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true); // Track first-time user
  const [hasCompletedFirstProject, setHasCompletedFirstProject] = useState(false);
  const [shouldOpenUploadOnMount, setShouldOpenUploadOnMount] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [bannerVariant, setBannerVariant] = useState<BannerVariant | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [softPaywallVariant, setSoftPaywallVariant] = useState<SoftPaywallVariant | null>(null);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [currentCredits, setCurrentCredits] = useState(2);
  const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
  const [purchaseData, setPurchaseData] = useState<{
    creditsPurchased: number;
    previousBalance: number;
    receiptNumber: string;
    sessionId: string;
  } | null>(null);

  // Temporary local state to track created projects (until Firestore permissions are fixed)
  const [localProjects, setLocalProjects] = useState<Array<{
    id: string;
    name: string;
    date: string;
    thumbnail?: string;
  }>>([]);

  // Check URL for upgrade success/canceled/welcome/credits routes
  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.includes('/credits/success')) {
      // Handle successful credit purchase
      const sessionId = params.get('session_id');
      if (sessionId) {
        // In production, verify session with backend
        // For now, simulate purchase data
        const creditsPurchased = 150; // Would come from session verification
        setPurchaseData({
          creditsPurchased,
          previousBalance: currentCredits,
          receiptNumber: `#${Math.floor(Math.random() * 90000) + 10000}`,
          sessionId
        });
        setShowPurchaseSuccess(true);
        setCurrentCredits(prev => prev + creditsPurchased);
      }
    } else if (path.includes('/upgrade/success')) {
      setCurrentView('upgrade-success');
    } else if (path.includes('/upgrade/canceled')) {
      setCurrentView('upgrade-canceled');
    } else if (path.includes('/welcome')) {
      setCurrentView('welcome');
      
      // Extract user name from URL params if available
      const params = new URLSearchParams(window.location.search);
      const name = params.get('name');
      if (name) {
        setUserName(decodeURIComponent(name));
      }
    }
  }, []);

  const handleOpenProject = (projectId: string) => {
    setSelectedProject(projectId);
    setCurrentView('editor');
  };

  const handleCreateNewProject = (shouldOpenUpload = false) => {
    setSelectedProject(null); // Null indica novo projeto

    // Adicionar projeto ao estado local temporariamente
    const newProject = {
      id: `local-${Date.now()}`,
      name: `Novo Projeto ${localProjects.length + 1}`,
      date: new Date().toLocaleDateString('pt-BR'),
      thumbnail: undefined
    };

    setLocalProjects(prev => [...prev, newProject]);
    console.log('🟢 Local project created:', newProject);

    // Abrir modal de upload se solicitado OU se for first-time user
    setShouldOpenUploadOnMount(shouldOpenUpload || (isFirstTimeUser && !hasCompletedFirstProject));
    setCurrentView('editor');
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    setSelectedProject(null);
    setShouldOpenUploadOnMount(false);
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentView('gallery');
  };

  const handleOpenPricing = () => {
    setCurrentView('pricing');
  };

  const handleBackFromPricing = () => {
    setCurrentView('gallery');
  };

  const handleTryAgainFromCanceled = () => {
    setCurrentView('gallery');
    setShouldOpenUpgradeModal(true);
  };

  const handleStartTour = () => {
    setCurrentView('gallery');
    // Open tour after a short delay to let Gallery render
    setTimeout(() => {
      setIsTourOpen(true);
    }, 300);
  };

  const handleSkipToApp = () => {
    setCurrentView('gallery');
  };

  const handleNavigateToWelcome = () => {
    setUserName('João Silva'); // Nome de teste
    setCurrentView('welcome');
  };

  const handleFirstProjectComplete = () => {
    setHasCompletedFirstProject(true);
    setIsFirstTimeUser(false);
  };

  const handleResetFirstTime = () => {
    setIsFirstTimeUser(true);
    setHasCompletedFirstProject(false);
    setCurrentView('gallery'); // Volta para a galeria
  };

  const handleOpenUpgradeModalFromSettings = (context: 'feature' | 'projects' | 'trial' | 'credits') => {
    setUpgradeModalContext(context);
    setShouldOpenUpgradeModal(true);
    setCurrentView('gallery');
  };

  const handleUploadComplete = () => {
    // Marca que upload foi completo
    setUploadCompleted(true);
  };

  const handleBannerDismiss = () => {
    setBannerDismissed(true);
    // Salvar em localStorage que foi dismissado por hoje
    const today = new Date().toDateString();
    localStorage.setItem('bannerDismissedDate', today);
  };

  const handleBannerCta = () => {
    // Diferentes ações baseadas no variant
    if (bannerVariant === 'trial-ended' || bannerVariant === 'plan-expired') {
      setCurrentView('pricing');
    } else if (bannerVariant === 'credits-low') {
      setUpgradeModalContext('credits');
      setShouldOpenUpgradeModal(true);
    } else if (bannerVariant === 'payment-failed') {
      setCurrentView('settings');
      // Poderia navegar direto para billing
    }
  };

  const handleShowBanner = (variant: BannerVariant) => {
    setBannerVariant(variant);
    setBannerDismissed(false);
  };

  const handleShowSoftPaywall = (variant: SoftPaywallVariant) => {
    setSoftPaywallVariant(variant);
  };

  const handleSoftPaywallUpgrade = () => {
    setSoftPaywallVariant(null);
    setCurrentView('pricing');
  };

  const handleCloseSoftPaywall = () => {
    setSoftPaywallVariant(null);
  };

  const handleOpenBuyCredits = () => {
    setShowBuyCreditsModal(true);
  };

  const handleClosePurchaseSuccess = () => {
    setShowPurchaseSuccess(false);
    setPurchaseData(null);
    // Clean URL
    window.history.replaceState({}, '', '/');
  };

  const handleStartCreating = () => {
    handleClosePurchaseSuccess();
    handleCreateNewProject();
  };

  const handleViewReceipt = () => {
    console.log('📄 View receipt:', purchaseData?.receiptNumber);
    // In production, navigate to receipt page or open modal
  };

  const handleDownloadReceipt = () => {
    console.log('📥 Download receipt PDF:', purchaseData?.receiptNumber);
    // In production, trigger PDF download
  };

  const handlePurchaseCredits = (packageId: string) => {
    // Simular compra de créditos
    let credits = 0;
    
    // Check if it's a custom package
    if (packageId.startsWith('custom-')) {
      credits = parseInt(packageId.split('-')[1], 10);
    } else {
      const packages: Record<string, number> = {
        starter: 50,
        popular: 150,
        pro: 300
      };
      credits = packages[packageId];
    }
    
    setCurrentCredits(prev => prev + credits);
    setShowBuyCreditsModal(false);
    
    // Mostrar toast de sucesso (seria bom ter ToastContext aqui)
    console.log(`✅ Compra realizada! +${credits} créditos adicionados. Total: ${currentCredits + credits}`);
  };

  // Verificar se deve mostrar o banner (exemplo de lógica)
  useEffect(() => {
    // Verifica se foi dismissado hoje
    const dismissedDate = localStorage.getItem('bannerDismissedDate');
    const today = new Date().toDateString();
    
    if (dismissedDate === today) {
      setBannerDismissed(true);
    }

    // Exemplo: mostrar banner trial-ended após welcome (apenas para demonstração)
    // Na produção, isso viria de uma API/estado global do usuário
    // setBannerVariant('trial-ended');
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleEmailSignUp = async (name: string, email: string, password: string) => {
    try {
      await signUpWithEmail(email, password, name);
    } catch (error) {
      console.error('Error signing up with email:', error);
    }
  };

  const handleEmailContinue = async (email: string) => {
    // For now, just log the email. You can implement password flow later
    console.log('Email login:', email);
    // TODO: Implement email/password flow with password input
  };

  const handleSignUpClick = () => {
    setAuthView('signup');
  };

  const handleSignInClick = () => {
    setAuthView('login');
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/signup screen if not authenticated
  if (!user) {
    if (authView === 'signup') {
      return (
        <SignUp
          onGoogleSignUp={handleGoogleSignIn}
          onEmailSignUp={handleEmailSignUp}
          onSignInClick={handleSignInClick}
        />
      );
    }

    return (
      <Login
        onGoogleSignIn={handleGoogleSignIn}
        onEmailContinue={handleEmailContinue}
        onSignUpClick={handleSignUpClick}
      />
    );
  }

  return (
    <ToastProvider>
      <div className={`h-full flex flex-col ${currentView === 'settings' || currentView === 'pricing' || currentView === 'upgrade-success' || currentView === 'upgrade-canceled' || currentView === 'welcome' ? 'bg-white' : 'bg-[#F7F7F8]'}`}>
        {/* Trial Ended Banner - Aparece em todas as views exceto Welcome */}
        {bannerVariant && !bannerDismissed && currentView !== 'welcome' && (
          <TrialEndedBanner
            variant={bannerVariant}
            onCtaClick={handleBannerCta}
            onDismiss={handleBannerDismiss}
            remainingCredits={1}
            totalCredits={5}
          />
        )}
        <div className="flex-1 min-h-0">
          {currentView === 'welcome' ? (
            <WelcomeScreen
              userName={userName}
              onStartTour={handleStartTour}
              onSkipToApp={handleSkipToApp}
            />
          ) : currentView === 'gallery' ? (
            <GalleryConnected
            onOpenProject={handleOpenProject}
            onCreateNewProject={handleCreateNewProject}
            onOpenSettings={handleOpenSettings}
            onOpenPricing={handleOpenPricing}
            onNavigateToWelcome={handleNavigateToWelcome}
            onStartTour={() => setIsTourOpen(true)}
            shouldOpenUpgradeModal={shouldOpenUpgradeModal}
            upgradeModalContext={upgradeModalContext}
            onUpgradeModalChange={(isOpen) => {
              if (!isOpen) setShouldOpenUpgradeModal(false);
            }}
            isFirstTime={isFirstTimeUser && !hasCompletedFirstProject}
            onFirstProjectComplete={handleFirstProjectComplete}
            onResetFirstTime={handleResetFirstTime}
            uploadCompleted={uploadCompleted}
            localProjects={localProjects}
          />
        ) : currentView === 'editor' ? (
          <Editor
            projectId={selectedProject}
            onBack={handleBackToGallery}
            onOpenUpgradeModal={(context) => {
              setUpgradeModalContext(context);
              setShouldOpenUpgradeModal(true);
              setCurrentView('gallery');
            }}
            onUploadComplete={handleUploadComplete}
            shouldOpenUploadOnMount={shouldOpenUploadOnMount}
            isFirstTimeUser={isFirstTimeUser && !hasCompletedFirstProject}
            onFirstProjectComplete={handleFirstProjectComplete}
          />
        ) : currentView === 'pricing' ? (
          <Pricing onBack={handleBackFromPricing} />
        ) : currentView === 'upgrade-success' ? (
          <UpgradeSuccess onContinue={handleBackToGallery} />
        ) : currentView === 'upgrade-canceled' ? (
          <UpgradeCanceled
            onBack={handleBackToGallery}
            onTryAgain={handleTryAgainFromCanceled}
          />
        ) : (
          <Settings
            onBack={handleBackFromSettings}
            onOpenPricing={handleOpenPricing}
            onOpenUpgradeModal={handleOpenUpgradeModalFromSettings}
            onNavigateToWelcome={handleNavigateToWelcome}
            onStartTour={() => setIsTourOpen(true)}
            onResetFirstTime={handleResetFirstTime}
            isFirstTimeUser={isFirstTimeUser && !hasCompletedFirstProject}
            onShowBanner={handleShowBanner}
            onShowSoftPaywall={handleShowSoftPaywall}
            onOpenBuyCredits={handleOpenBuyCredits}
            onSignOut={signOut}
          />
        )}
        </div>

        {/* Soft Paywall Overlays */}
        {softPaywallVariant && (
          <div className="fixed inset-0 z-[1000]">
            <SoftPaywall
              variant={softPaywallVariant}
              onUpgrade={handleSoftPaywallUpgrade}
              onViewPlans={() => {
                setSoftPaywallVariant(null);
                setCurrentView('pricing');
              }}
              selectedCount={10}
              previewImages={[
                'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&h=300&fit=crop',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=300&fit=crop',
              ]}
              previewImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=675&fit=crop"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                alt="Preview"
                className="w-full h-auto rounded-lg"
              />
            </SoftPaywall>
          </div>
        )}

        {/* Buy Credits Modal */}
        <BuyCreditsModal
          isOpen={showBuyCreditsModal}
          onClose={() => setShowBuyCreditsModal(false)}
          onPurchase={handlePurchaseCredits}
          onViewPlans={() => {
            setShowBuyCreditsModal(false);
            setCurrentView('pricing');
          }}
          currentBalance={currentCredits}
        />

        {/* Purchase Success Modal */}
        {purchaseData && (
          <PurchaseSuccessModal
            isOpen={showPurchaseSuccess}
            onClose={handleClosePurchaseSuccess}
            onStartCreating={handleStartCreating}
            onViewReceipt={handleViewReceipt}
            onDownloadReceipt={handleDownloadReceipt}
            onHelp={() => {
              console.log('🆘 Open help center');
              // In production, open help center or FAQ
            }}
            creditsPurchased={purchaseData.creditsPurchased}
            previousBalance={purchaseData.previousBalance}
            receiptNumber={purchaseData.receiptNumber}
            userEmail="usuario@exemplo.com"
          />
        )}

        {/* Feature Tour */}
        <FeatureTour
          isOpen={isTourOpen}
          onClose={() => setIsTourOpen(false)}
          onComplete={() => {
            setIsTourOpen(false);
            console.log('✅ Tour completed!');
          }}
        />
      </div>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
