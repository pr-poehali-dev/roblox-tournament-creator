import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface ReportsTabProps {
  user: any | null;
}

export const ReportsTab = ({ user }: ReportsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    reported_player: '',
    report_type: 'cheating',
    description: '',
  });
  const { toast } = useToast();

  const handleSubmitReport = async () => {
    if (!user) {
      toast({
        title: '⚠️ Требуется авторизация',
        description: 'Войдите, чтобы отправить отзыв или жалобу',
        variant: 'destructive',
      });
      return;
    }

    if (!newReport.reported_player || !newReport.description) {
      toast({
        title: '⚠️ Заполните все поля',
        description: 'Имя игрока и описание обязательны',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/fb17521b-3570-4496-928f-9cc3b7ff4b08', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newReport,
          user_id: user.id,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: '✅ Отправлено!',
          description: 'Ваше сообщение принято и будет рассмотрено',
        });
        setIsDialogOpen(false);
        setNewReport({ reported_player: '', report_type: 'cheating', description: '' });
      }
    } catch (error) {
      toast({
        title: '❌ Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Отзывы и жалобы на игроков</h3>
        <p className="text-muted-foreground">Сообщите о нарушениях или оставьте отзыв</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Flag" className="h-6 w-6 text-destructive" />
              Пожаловаться на игрока
            </CardTitle>
            <CardDescription>Сообщите о читерах, токсичности или других нарушениях</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  <Icon name="AlertTriangle" className="mr-2 h-4 w-4" />
                  Подать жалобу
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Подать жалобу на игрока</DialogTitle>
                  <DialogDescription>Опишите проблему подробно</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Имя игрока (Roblox никнейм)</Label>
                    <Input 
                      placeholder="PlayerName123" 
                      value={newReport.reported_player}
                      onChange={(e) => setNewReport({...newReport, reported_player: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Тип жалобы</Label>
                    <Select 
                      value={newReport.report_type}
                      onValueChange={(value) => setNewReport({...newReport, report_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cheating">Читерство / Эксплойты</SelectItem>
                        <SelectItem value="toxicity">Токсичное поведение</SelectItem>
                        <SelectItem value="teaming">Сговор с противниками</SelectItem>
                        <SelectItem value="spam">Спам / Реклама</SelectItem>
                        <SelectItem value="other">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Описание проблемы</Label>
                    <Textarea 
                      placeholder="Опишите что произошло..." 
                      rows={4}
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSubmitReport}>
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить жалобу
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="MessageCircle" className="h-6 w-6 text-primary" />
              Оставить отзыв
            </CardTitle>
            <CardDescription>Похвалите хорошего игрока или поделитесь опытом</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Icon name="ThumbsUp" className="mr-2 h-4 w-4" />
                  Написать отзыв
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Оставить отзыв</DialogTitle>
                  <DialogDescription>Расскажите о своем опыте</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Имя игрока (Roblox никнейм)</Label>
                    <Input 
                      placeholder="PlayerName123" 
                      value={newReport.reported_player}
                      onChange={(e) => setNewReport({...newReport, reported_player: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Ваш отзыв</Label>
                    <Textarea 
                      placeholder="Отличный игрок, честно играл..." 
                      rows={4}
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value, report_type: 'positive'})}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => {
                      setNewReport({...newReport, report_type: 'positive'});
                      handleSubmitReport();
                    }}
                  >
                    <Icon name="Send" className="mr-2 h-4 w-4" />
                    Отправить отзыв
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Icon name="Info" className="h-6 w-6" />
            Правила подачи жалоб
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="flex items-start gap-2 text-sm">
            <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
            Указывайте точный никнейм игрока в Roblox
          </p>
          <p className="flex items-start gap-2 text-sm">
            <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
            Описывайте ситуацию максимально подробно
          </p>
          <p className="flex items-start gap-2 text-sm">
            <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
            Прикладывайте доказательства (ссылки на видео/скриншоты)
          </p>
          <p className="flex items-start gap-2 text-sm">
            <Icon name="CheckCircle" className="h-5 w-5 text-secondary mt-0.5" />
            Ложные жалобы приведут к блокировке вашего аккаунта
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsTab;
