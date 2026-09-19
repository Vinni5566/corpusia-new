import { useEffect } from "react";
import { toast } from "sonner";
import { generateComplianceReport } from "@/lib/lab/reportGenerator";
import { playSuccessChime, playShieldHum } from "@/lib/soundEngine";

export function usePresenterHotkeys(onTriggerDemo?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in inputs or textareas
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key ? e.key.toUpperCase() : "";

      if (e.shiftKey && key === "D") {
        e.preventDefault();
        playSuccessChime();
        if (onTriggerDemo) {
          onTriggerDemo();
        } else {
          toast.info("HotKey Triggered: Demo Mode", {
            description: "Use the topbar 'Demo Mode' button for full guided presentation.",
          });
        }
      }

      if (e.shiftKey && key === "E") {
        e.preventDefault();
        playSuccessChime();
        toast.info("HotKey Triggered: Exporting Compliance PDF Report...");
        generateComplianceReport();
      }

      if (e.shiftKey && key === "A") {
        e.preventDefault();
        playShieldHum();
        toast.error("HotKey Triggered: Adversarial Red-Team Injection Test Simulated!");
      }

      if (e.shiftKey && key === "M") {
        e.preventDefault();
        playSuccessChime();
        toast.info("HotKey Triggered: Agent Memory & RAG Inspector", {
          description: "Inspect vector embeddings, similarity scores & token budgets in the topbar button.",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTriggerDemo]);
}
