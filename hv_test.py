from locust import HttpUser, TaskSet, task


def login(l):
    l.client.post("/auth/login/", {"username":"admin", "password":"123"})


def logout(l):
    l.client.post("/auth/logout/", {"username":"admin", "password":"123"})


def index(l):
    l.client.get("/")

# def profile(l):
#     l.client.get("auth/edit/")


def products(l):
    l.client.get("/products/")


@task
class UserBehavior(TaskSet):
    tasks = {index: 2, products: 5}

    def on_start(self):
        login(self)

    def on_stop(self):
        logout(self)
@task
class WebsiteUser(HttpUser):
    task_set = UserBehavior
    min_wait = 5000
    max_wait = 9000