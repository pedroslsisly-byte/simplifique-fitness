import { useEffect } from 'react';

interface Alarme {
  id: string;
  tipo: 'agua' | 'treino' | 'refeicao';
  nome: string;
  horario: string;
  ativo: boolean;
}

export const useAlarmMonitor = (alarms: Alarme[]) => {
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      const currentDay = now.getDay();

      alarms.forEach(alarm => {
        if (!alarm.ativo) return;
        
        const alarmTime = alarm.horario.substring(0, 5);
        
        if (alarmTime === currentTime) {
          if (Notification.permission === 'granted') {
            new Notification(`🔔 ${alarm.nome}`, {
              body: `Hora de ${alarm.tipo}!`,
              icon: '/icon.png'
            });
          }
          
          console.log(`🔔 Alarme: ${alarm.nome}`);
        }
      });
    };

    const interval = setInterval(checkAlarms, 60000);
    checkAlarms();

    return () => clearInterval(interval);
  }, [alarms]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
};