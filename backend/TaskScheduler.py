import schedule
import time
import threading


class TaskScheduler:
    def __init__(self,app) -> None:
        self.app=app
        return

    def start(self) -> None:
        threading.Thread(target=self.loop).start()

    def loop(self) -> None:
        while True:
            time.sleep(60*5)
            with self.app.app_context():
                schedule.run_pending()

    def add_Daily_Task(self, task, *args) -> None:
        if len(args) > 0:
            schedule.every().day.at("00:01").do(task, args)
        else:
            schedule.every().day.at("00:01").do(task)
    
    def add_5min_Task(self, task, *args) -> None:
        if len(args) > 0:
            schedule.every(5).minutes.do(task, args)
        else:
            schedule.every(5).minutes.do(task)
