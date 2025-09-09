import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobApplyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  companyName: string;
}

export function JobApplyDrawer({ open, onOpenChange, jobTitle, companyName }: JobApplyDrawerProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Bewerbung erfolgreich",
      description: "Ihre Bewerbung wurde erfolgreich übermittelt.",
    });
    
    // Close drawer after a short delay
    setTimeout(() => {
      onOpenChange(false);
      setIsSubmitted(false);
      setMessage('');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DrawerTitle className="text-xl">Bewerbung erfolgreich!</DrawerTitle>
            <p className="text-muted-foreground">
              Ihre Bewerbung für "{jobTitle}" bei {companyName} wurde übermittelt.
            </p>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bewerbung für "{jobTitle}"</DrawerTitle>
          <p className="text-muted-foreground">
            bei {companyName}
          </p>
        </DrawerHeader>
        
        <div className="px-4 pb-4 space-y-6">
          {/* Info Text */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Vielen Dank für Ihr Interesse! Wir freuen uns auf Ihre Bewerbung.
            </p>
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <Label>Lebenslauf (optional)</Label>
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  CV hochladen oder aus Profil verwenden
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  CV aus Profil verwenden
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Kurze Nachricht</Label>
            <Textarea
              id="message"
              placeholder="Erzählen Sie uns, warum Sie für diese Position geeignet sind..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 Zeichen
            </p>
          </div>
        </div>

        <DrawerFooter>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Wird übermittelt..." : "Bewerbung abschicken"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
