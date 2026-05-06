import { useEffect, useRef, useCallback } from 'react';

interface Alarme {
  id: string;
  tipo: 'agua' | 'treino' | 'refeicao';
  nome: string;
  horario: string;
  ativo: boolean;
  diasSemana: number[];
  som: string;
}

const SOUNDS: Record<string, string> = {
  bell: 'https://www.soundjay.com/buttons/sounds/beep-01a.mp3',
  digital: 'https://www.soundjay.com/buttons/sounds/beep-02.mp3',
  energy: 'https://www.soundjay.com/buttons/sounds/beep-07a.mp3',
};

export const useAlarmMonitor = (alarms: Alarme[]) => {
  const lastPlayedRef = useRef<string>('');

  const playSound = useCallback((soundType: string) => {
    const soundUrl = SOUNDS[soundType] || SOUNDS.bell;
    
    const audio = new Audio(soundUrl);
    audio.volume = 1;
    
    audio.play().catch(err => {
      console.log('Erro ao tocar som, usando fallback:', err);
      const beepAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRQrV6rP2L1+EykYf8Li5L17IjVGsMXl37h9I0WxweLduoUiS7LF4+C3gyVMssLh4LGAHk6zweDfuYIfTrQA4+C0gCJPtADe4LOAHU+1AN7gs4AdT7UA3uCzgB1PtQDe4LOAHU+1');
      beepAudio.volume = 0.5;
      beepAudio.play().catch(() => {});
    });
  }, []);

  const showNotification = useCallback((alarm: Alarme) => {
    if (Notification.permission === 'granted') {
      new Notification(`🔔 ${alarm.nome}`, {
        body: `Hora de ${alarm.tipo}!`,
        icon: '/icon.png',
        tag: alarm.id,
        requireInteraction: true,
      });
    }
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentSecond = now.getSeconds();
      const currentTime = `${currentHour}:${currentMinute}`;
      const currentDay = now.getDay();

      alarms.forEach(alarm => {
        if (!alarm.ativo) return;
        
        const alarmTime = alarm.horario.substring(0, 5);
        
        if (alarmTime === currentTime && alarm.diasSemana.includes(currentDay)) {
          const alarmKey = `${alarm.id}-${currentTime}`;
          
          if (lastPlayedRef.current !== alarmKey && currentSecond < 2) {
            lastPlayedRef.current = alarmKey;
            
            console.log(`🔔 ALARME: ${alarm.nome} - Som: ${alarm.som}`);
            
            playSound(alarm.som);
            setTimeout(() => showNotification(alarm), 500);
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 1000);
    checkAlarms();

    return () => clearInterval(interval);
  }, [alarms, playSound, showNotification]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permissão de notificação:', permission);
      });
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
};