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

const Index = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
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
  }, []);

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

  const activeTournaments = [
    {
      id: 1,
      name: 'Новогодний Чемпионат 2025',
      game: 'Arsenal',
      players: 245,
      maxPlayers: 256,
      prize: '10,000 Robux',
      status: 'Регистрация',
      startDate: '1 января',
      teams: 32,
    },
    {
      id: 2,
      name: 'Зимний PvP Турнир',
      game: 'Blade Ball',
      players: 128,
      maxPlayers: 128,
      prize: '5,000 Robux',
      status: 'В игре',
      startDate: 'Сейчас',
      teams: 16,
    },
    {
      id: 3,
      name: 'Рождественская Битва',
      game: 'Combat Warriors',
      players: 89,
      maxPlayers: 128,
      prize: '7,500 Robux',
      status: 'Регистрация',
      startDate: '25 декабря',
      teams: 16,
    },
  ];

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake text-blue-200 text-2xl"
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

      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-blue-100 shadow-sm">
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
              <Button onClick={handleTelegramButtonClick} disabled={isAuthLoading}>
                <Icon name="Send" className="mr-2 h-4 w-4" />
                {isAuthLoading ? 'Вход...' : 'Войти через Telegram'}
              </Button>
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
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="tournaments" className="text-base py-3">
              <Icon name="Trophy" className="mr-2 h-5 w-5" />
              Турниры
            </TabsTrigger>
            <TabsTrigger value="pvp" className="text-base py-3">
              <Icon name="Swords" className="mr-2 h-5 w-5" />
              PvP 1 на 1
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
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Icon name="Plus" className="mr-2 h-5 w-5" />
                    Создать турнир
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новый турнир</DialogTitle>
                    <DialogDescription>Заполните информацию о турнире</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Название турнира</Label>
                      <Input placeholder="Новогодний турнир" />
                    </div>
                    <div>
                      <Label>Игра Roblox</Label>
                      <Input placeholder="Arsenal, Blade Ball, Combat Warriors..." />
                    </div>
                    <div>
                      <Label>Количество команд</Label>
                      <Input type="number" placeholder="16" />
                    </div>
                    <div>
                      <Label>Призовой фонд (Robux)</Label>
                      <Input type="number" placeholder="5000" />
                    </div>
                    <Button className="w-full">Создать турнир</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-lg transition-all hover-scale border-2">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{tournament.name}</CardTitle>
                      <Badge variant={tournament.status === 'В игре' ? 'destructive' : 'default'}>
                        {tournament.status}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Icon name="Gamepad2" className="h-4 w-4" />
                      {tournament.game}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Игроков:</span>
                      <span className="font-semibold">
                        {tournament.players}/{tournament.maxPlayers}
                      </span>
                    </div>
                    <Progress value={(tournament.players / tournament.maxPlayers) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Команд:</span>
                      <span className="font-semibold">{tournament.teams}</span>
                    </div>
                    <div className="flex items-center gap-2 text-accent font-bold text-lg">
                      <Icon name="Trophy" className="h-5 w-5" />
                      {tournament.prize}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Calendar" className="h-4 w-4" />
                      Старт: {tournament.startDate}
                    </div>
                    <Button className="w-full" variant={tournament.status === 'В игре' ? 'outline' : 'default'}>
                      {tournament.status === 'В игре' ? 'Смотреть' : 'Зарегистрироваться'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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

      <footer className="mt-16 border-t bg-white/50 backdrop-blur-sm">
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