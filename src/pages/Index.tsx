import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VipServersTab from '@/components/VipServersTab';
import ReportsTab from '@/components/ReportsTab';

interface User {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  photo_url: string;
  wins: number;
  losses: number;
  rating: number;
  team_name: string | null;
}

interface Tournament {
  id: number;
  name: string;
  game: string;
  robloxServerUrl: string;
  maxPlayers: number;
  prize: number;
  players: number;
  status: string;
  startDate: string | null;
  createdAt: string;
  creator?: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

const Index = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    game_name: '',
    roblox_server_url: '',
    max_players: 64,
    prize_robux: 5000,
  });
  const { toast } = useToast();

  useEffect(() => {
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
    }));
    setSnowflakes(flakes);

    const savedUser = localStorage.getItem('tournament_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    setIsLoadingTournaments(true);
    try {
      const response = await fetch('https://functions.poehali.dev/bcdfbe86-b6a2-4caa-9d27-53d91e51880f');
      const data = await response.json();
      if (data.tournaments) {
        setTournaments(data.tournaments);
      }
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    } finally {
      setIsLoadingTournaments(false);
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleTelegramAuth = async (telegramUser: any) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6a404a77-50e6-42fd-baa3-b91c6df00498', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_data: telegramUser,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('tournament_user', JSON.stringify(data.user));
        toast({
          title: '✅ Успешный вход!',
          description: `Добро пожаловать, ${data.user.first_name}!`,
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка входа',
        description: 'Не удалось войти через Telegram',
        variant: 'destructive',
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tournament_user');
    toast({
      title: 'Вы вышли из аккаунта',
    });
  };

  const handleTelegramButtonClick = () => {
    const telegramData = {
      id: Math.floor(Math.random() * 1000000000),
      username: 'demo_user',
      first_name: 'Демо',
      last_name: 'Игрок',
      photo_url: '',
    };
    handleTelegramAuth(telegramData);
  };

  const handleRobloxAuth = async () => {
    const robloxUserId = prompt('Введите ваш Roblox User ID:');
    const robloxUsername = prompt('Введите ваш Roblox никнейм:');
    
    if (!robloxUserId || !robloxUsername) return;
    
    try {
      const response = await fetch('https://functions.poehali.dev/8ca9ea0f-f7d2-4007-9e14-4e54d7bf5502', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roblox_data: {
            id: parseInt(robloxUserId),
            name: robloxUsername,
            displayName: robloxUsername,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('tournament_user', JSON.stringify(data.user));
        toast({
          title: '✅ Успешный вход!',
          description: `Добро пожаловать, ${data.user.first_name}!`,
        });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка входа',
        description: 'Не удалось войти через Roblox',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTournament = async () => {
    if (!user) {
      toast({
        title: '⚠️ Требуется авторизация',
        description: 'Войдите через Telegram, чтобы создать турнир',
        variant: 'destructive',
      });
      return;
    }

    if (!newTournament.name || !newTournament.game_name || !newTournament.roblox_server_url) {
      toast({
        title: '⚠️ Заполните все поля',
        description: 'Все поля обязательны для создания турнира',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/bcdfbe86-b6a2-4caa-9d27-53d91e51880f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTournament,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Турнир создан!',
          description: `Турнир "${newTournament.name}" успешно создан`,
        });
        setIsCreateDialogOpen(false);
        setNewTournament({
          name: '',
          game_name: '',
          roblox_server_url: '',
          max_players: 64,
          prize_robux: 5000,
        });
        loadTournaments();
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка создания',
        description: 'Не удалось создать турнир',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Скоро';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const pvpMatches = [
    { id: 1, player1: 'SnowKing', player2: 'FrostWarrior', game: 'Arsenal', status: 'live', viewers: 145 },
    { id: 2, player1: 'IceQueen', player2: 'BlizzardMaster', game: 'Blade Ball', status: 'waiting', viewers: 0 },
    { id: 3, player1: 'WinterHero', player2: 'ColdStrike', game: 'Combat Warriors', status: 'live', viewers: 89 },
  ];

  const leaderboard = [
    { rank: 1, name: 'SnowKing', wins: 142, rating: 2450, team: 'Frost Legends' },
    { rank: 2, name: 'IceQueen', wins: 138, rating: 2380, team: 'Winter Warriors' },
    { rank: 3, name: 'FrostWarrior', wins: 125, rating: 2290, team: 'Snow Squad' },
    { rank: 4, name: 'BlizzardMaster', wins: 118, rating: 2210, team: 'Ice Breakers' },
    { rank: 5, name: 'WinterHero', wins: 112, rating: 2150, team: 'Arctic Force' },
  ];

  const prizes = [
    { place: '🥇 1 место', reward: '10,000 Robux + Легендарный титул', icon: 'Trophy' },
    { place: '🥈 2 место', reward: '5,000 Robux + Эпический титул', icon: 'Medal' },
    { place: '🥉 3 место', reward: '2,500 Robux + Редкий титул', icon: 'Award' },
    { place: '🎖️ 4-10 место', reward: '1,000 Robux + Особый значок', icon: 'Star' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake text-blue-200 dark:text-blue-400 text-2xl"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            fontSize: `${Math.random() * 10 + 10}px`,
          }}
        >
          ❄
        </div>
      ))}

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-blue-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-float">🎮</div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Roblox Турниры</h1>
              <p className="text-xs text-muted-foreground">Новогодний сезон 2025</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Icon name="Home" className="mr-2 h-4 w-4" />
              Главная
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Trophy" className="mr-2 h-4 w-4" />
              Турниры
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Swords" className="mr-2 h-4 w-4" />
              PvP 1 на 1
            </Button>
            <Button variant="ghost" size="sm">
              <Icon name="Users" className="mr-2 h-4 w-4" />
              Команды
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Icon name={isDarkMode ? 'Sun' : 'Moon'} className="h-5 w-5" />
            </Button>
{user ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Icon name="UserCircle" className="mr-2 h-4 w-4" />
                    {user.first_name}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Профиль игрока</DialogTitle>
                    <DialogDescription>Ваша статистика и достижения</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        {user.photo_url ? (
                          <AvatarImage src={user.photo_url} />
                        ) : (
                          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                            {user.first_name[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-xl">{user.first_name} {user.last_name}</h3>
                        {user.username && (
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Рейтинг: {user.rating}</p>
                        <Badge className="mt-1">Участник турниров</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{user.wins}</p>
                        <p className="text-xs text-muted-foreground">Побед</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-destructive">{user.losses}</p>
                        <p className="text-xs text-muted-foreground">Поражений</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">
                          {user.wins + user.losses > 0
                            ? Math.round((user.wins / (user.wins + user.losses)) * 100)
                            : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Винрейт</p>
                      </div>
                    </div>
                    {user.team_name && (
                      <div className="p-3 bg-secondary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Команда</p>
                        <p className="font-bold">{user.team_name}</p>
                      </div>
                    )}
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      <Icon name="LogOut" className="mr-2 h-4 w-4" />
                      Выйти
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleRobloxAuth} disabled={isAuthLoading} variant="default">
                  <Icon name="Gamepad2" className="mr-2 h-4 w-4" />
                  {isAuthLoading ? 'Вход...' : 'Roblox'}
                </Button>
                <Button onClick={handleTelegramButtonClick} disabled={isAuthLoading} variant="outline">
                  <Icon name="Send" className="mr-2 h-4 w-4" />
                  Telegram
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-4xl"></span>
            <h2 className="text-5xl font-bold text-primary">Новогодний Турнирный Сезон</h2>
            <span className="text-4xl"></span>
          </div>
          <p className="text-xl text-muted-foreground">Создавай команды, участвуй в турнирах, побеждай в PvP!</p>
        </div>

        <Tabs defaultValue="tournaments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="tournaments" className="text-base py-3">
              <Icon name="Trophy" className="mr-2 h-5 w-5" />
              Турниры
            </TabsTrigger>
            <TabsTrigger value="vip-servers" className="text-base py-3">
              <Icon name="Server" className="mr-2 h-5 w-5" />
              VIP Серверы
            </TabsTrigger>
            <TabsTrigger value="pvp" className="text-base py-3">
              <Icon name="Swords" className="mr-2 h-5 w-5" />
              PvP 1 на 1
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-base py-3">
              <Icon name="Flag" className="mr-2 h-5 w-5" />
              Отзывы/Жалобы
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-base py-3">
              <Icon name="BarChart3" className="mr-2 h-5 w-5" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="prizes" className="text-base py-3">
              <Icon name="Gift" className="mr-2 h-5 w-5" />
              Призы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">Активные турниры</h3>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Icon name="Plus" className="mr-2 h-5 w-5" />
                    Создать турнир
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новый турнир</DialogTitle>
                    <DialogDescription>Заполните информацию о турнире в Roblox</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Название турнира</Label>
                      <Input 
                        placeholder="Новогодний турнир" 
                        value={newTournament.name}
                        onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Игра Roblox</Label>
                      <Input 
                        placeholder="Arsenal, Blade Ball, Combat Warriors..." 
                        value={newTournament.game_name}
                        onChange={(e) => setNewTournament({...newTournament, game_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Ссылка на сервер Roblox</Label>
                      <Input 
                        placeholder="https://www.roblox.com/games/..." 
                        value={newTournament.roblox_server_url}
                        onChange={(e) => setNewTournament({...newTournament, roblox_server_url: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Максимум игроков</Label>
                      <Input 
                        type="number" 
                        placeholder="64" 
                        value={newTournament.max_players}
                        onChange={(e) => setNewTournament({...newTournament, max_players: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label>Призовой фонд (Robux)</Label>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        value={newTournament.prize_robux}
                        onChange={(e) => setNewTournament({...newTournament, prize_robux: parseInt(e.target.value)})}
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateTournament}>
                      <Icon name="Sparkles" className="mr-2 h-4 w-4" />
                      Создать турнир
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingTournaments ? (
              <div className="text-center py-12">
                <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-4">Загрузка турниров...</p>
              </div>
            ) : tournaments.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Trophy" className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">Пока нет турниров</p>
                <p className="text-muted-foreground">Создайте первый турнир!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="hover:shadow-lg transition-all hover-scale border-2">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <Badge variant={tournament.status === 'registration' ? 'default' : 'destructive'}>
                          {tournament.status === 'registration' ? 'Регистрация' : 'В игре'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Icon name="Gamepad2" className="h-4 w-4" />
                        {tournament.game}
                      </CardDescription>
                      {tournament.creator && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Создатель: {tournament.creator.first_name} {tournament.creator.last_name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Игроков:</span>
                        <span className="font-semibold">
                          {tournament.players}/{tournament.maxPlayers}
                        </span>
                      </div>
                      <Progress value={(tournament.players / tournament.maxPlayers) * 100} className="h-2" />
                      <div className="flex items-center gap-2 text-accent font-bold text-lg">
                        <Icon name="Trophy" className="h-5 w-5" />
                        {tournament.prize.toLocaleString()} Robux
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="Calendar" className="h-4 w-4" />
                        Старт: {formatDate(tournament.startDate)}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          variant={tournament.status === 'registration' ? 'default' : 'outline'}
                          onClick={() => window.open(tournament.robloxServerUrl, '_blank')}
                        >
                          <Icon name="ExternalLink" className="mr-2 h-4 w-4" />
                          {tournament.status === 'registration' ? 'Войти на сервер' : 'Смотреть'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vip-servers">
            <VipServersTab user={user} />
          </TabsContent>

          <TabsContent value="pvp" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">PvP матчи 1 на 1</h3>
              <Button size="lg" variant="secondary">
                <Icon name="Swords" className="mr-2 h-5 w-5" />
                Найти соперника
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pvpMatches.map((match) => (
                <Card key={match.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardDescription className="flex items-center gap-2 mb-2">
                      <Icon name="Gamepad2" className="h-4 w-4" />
                      {match.game}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {match.player1[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{match.player1}</span>
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground">VS</div>
                      <div className="flex flex-col items-center gap-2">
                        <Avatar>
                          <AvatarFallback className="bg-secondary text-secondary-foreground">
                            {match.player2[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{match.player2}</span>
                      </div>
                    </div>
                    {match.status === 'live' && (
                      <div className="flex items-center justify-center gap-2 text-destructive">
                        <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                        <span className="font-semibold">В ЭФИРЕ</span>
                        <Icon name="Eye" className="h-4 w-4 ml-2" />
                        <span>{match.viewers}</span>
                      </div>
                    )}
                    <Button className="w-full" variant={match.status === 'live' ? 'default' : 'outline'}>
                      {match.status === 'live' ? 'Смотреть матч' : 'Ожидание'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab user={user} />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Топ игроков сезона</h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-4 hover:bg-accent/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`text-2xl font-bold w-10 h-10 rounded-full flex items-center justify-center ${
                            player.rank === 1
                              ? 'bg-accent text-accent-foreground'
                              : player.rank === 2
                              ? 'bg-muted'
                              : player.rank === 3
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-secondary/20'
                          }`}
                        >
                          {player.rank}
                        </div>
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {player.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold">{player.name}</p>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Побед</p>
                          <p className="text-lg font-bold">{player.wins}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Рейтинг</p>
                          <p className="text-lg font-bold text-primary">{player.rating}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes" className="space-y-4">
            <h3 className="text-2xl font-bold mb-4">Призы и награды</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {prizes.map((prize, index) => (
                <Card key={index} className="hover:shadow-xl transition-all hover-scale border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <Icon name={prize.icon as any} className="h-8 w-8 text-accent" />
                      {prize.place}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg">{prize.reward}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon name="Info" className="h-6 w-6" />
                  Правила турниров
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
                  Команды формируются из 4-8 игроков в зависимости от турнира
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
                  Регистрация закрывается за 24 часа до начала турнира
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
                  Все матчи проводятся на официальных Roblox серверах
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
                  Призы выплачиваются в течение 48 часов после завершения турнира
                </p>
                <p className="flex items-start gap-2">
                  <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
                  Запрещено использование читов и эксплойтов (бан навсегда)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-16 border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="flex items-center justify-center gap-2 text-lg">
            <span className="text-2xl">🎮</span>
            Roblox Турниры - Новогодний сезон 2025
            <span className="text-2xl">🎄</span>
          </p>
          <p className="text-sm mt-2">Создавай команды • Побеждай в турнирах • Выигрывай призы</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;