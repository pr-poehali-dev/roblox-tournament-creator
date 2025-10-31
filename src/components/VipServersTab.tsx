import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface VipServer {
  id: number;
  game_name: string;
  server_url: string;
  online_players: number;
  max_players: number;
  created_at: string;
  creator_name: string;
}

interface VipServersTabProps {
  user: any | null;
}

export const VipServersTab = ({ user }: VipServersTabProps) => {
  const [servers, setServers] = useState<VipServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newServer, setNewServer] = useState({
    game_name: '',
    server_url: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ba1a4360-7539-430e-8cf4-a94e8dd83efa');
      const data = await response.json();
      if (data.servers) {
        setServers(data.servers);
      }
    } catch (error) {
      console.error('Failed to load VIP servers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateServer = async () => {
    if (!user) {
      toast({
        title: '⚠️ Требуется авторизация',
        description: 'Войдите, чтобы добавить VIP сервер',
        variant: 'destructive',
      });
      return;
    }

    if (!newServer.game_name || !newServer.server_url) {
      toast({
        title: '⚠️ Заполните все поля',
        description: 'Название игры и ссылка обязательны',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/ba1a4360-7539-430e-8cf4-a94e8dd83efa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newServer,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ VIP сервер добавлен!',
          description: `Сервер "${newServer.game_name}" успешно добавлен`,
        });
        setIsDialogOpen(false);
        setNewServer({ game_name: '', server_url: '' });
        loadServers();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось добавить VIP сервер',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Бесплатные VIP серверы Roblox</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Icon name="Plus" className="mr-2 h-5 w-5" />
              Добавить VIP сервер
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить бесплатный VIP сервер</DialogTitle>
              <DialogDescription>Поделитесь ссылкой на свой VIP сервер</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название игры</Label>
                <Input 
                  placeholder="Arsenal, Blade Ball..." 
                  value={newServer.game_name}
                  onChange={(e) => setNewServer({...newServer, game_name: e.target.value})}
                />
              </div>
              <div>
                <Label>Ссылка на VIP сервер</Label>
                <Input 
                  placeholder="https://www.roblox.com/games/..." 
                  value={newServer.server_url}
                  onChange={(e) => setNewServer({...newServer, server_url: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={handleCreateServer}>
                <Icon name="Server" className="mr-2 h-4 w-4" />
                Добавить сервер
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Загрузка серверов...</p>
        </div>
      ) : servers.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Server" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-semibold mb-2">Пока нет VIP серверов</p>
          <p className="text-muted-foreground">Будьте первым, кто поделится!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servers.map((server) => (
            <Card key={server.id} className="hover:shadow-lg transition-all hover-scale border-2">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{server.game_name}</CardTitle>
                  <Badge variant="secondary">
                    <Icon name="Users" className="h-3 w-3 mr-1" />
                    {server.online_players}/{server.max_players}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Добавил: {server.creator_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="Activity" className="h-4 w-4 text-secondary" />
                  <span className="font-semibold text-secondary">
                    {server.online_players} игроков онлайн
                  </span>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => window.open(server.server_url, '_blank')}
                >
                  <Icon name="ExternalLink" className="mr-2 h-4 w-4" />
                  Присоединиться
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VipServersTab;
