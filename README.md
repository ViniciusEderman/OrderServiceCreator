ORDER:
    [] - criação de pedido
    [] - atualização do pedido(status: Status)
    

NOTIFICATION USER(ORDER):
Notificação via(email | sms) baseado no status do pedido

exemplo de body passado pra order-service
{
  clientId: "83f87c4f989898",
  status: "pending"
}

exemplo para update order: lembre d epassar o orderId na url
{
  "newStatus": "finished"
}

criação do schema com prisma_orm:
npx prisma migrate dev --name init

DOCKER:
docker-compose build --no-cache && docker-compose up

# Arquitetura: 
Clean Architecture / Hexagonal Architecture (Ports & Adapters)
Motivo -> "O domínio é o centro da aplicação e tudo o mais deve depender dele — nunca o contrário." - by Robert C. Martin
As interfaces fazem o papel de Ports, enquanto suas implementações concretas são os Adapters.
Uso do conceito DIP(SOLID) --> Testabilidade(mocks de use-cases) + baixo acoplamento + alta capacidade de evolução e substituição de tecnologias(trocar o prisma por outro ORM ou trocar o winston por outro logging)
Order.create() implementa um Factory Method(pattern)

MELHORIAS para implementar:
Rota de update como será publicado na fila para o consumo do NotificationService?
Implementar logica de retry para fila 
