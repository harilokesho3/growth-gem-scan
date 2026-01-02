import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Calendar, Monitor } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">StartupSaver</span>
        </Link>
        
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#consulting" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Consulting
          </a>
          <Link to="/book-call" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Book a Call
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/schedule-demo">
            <Button size="sm" className="gap-2">
              <Monitor className="h-4 w-4" />
              Schedule Demo
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
