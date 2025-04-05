
import { useLoading } from "@/context/LoadingContext";
import { usePageLoading } from "@/hooks/usePageLoading";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingSpinner } from "./ui/loading-spinner";

export function PageTransitionLoader() {
  // Setup page transition loading on navigation
  usePageLoading();
  const { isPageLoading } = useLoading();

  return (
    <AnimatePresence>
      {isPageLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 h-1 bg-background"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 animate-progress-bar" />
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2">
            <LoadingSpinner size="xs" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
