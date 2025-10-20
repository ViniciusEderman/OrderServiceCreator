# DOMAIN

ORDER:
    [] - criação de pedido
    [] - atualização do pedido(status: pendente, aceito, cancelado e finalizado)
    

NOTIFICATION USER(ORDER):
Notificação via(email/sms) baseado no status do pedido

# Infrastructure
(retentativa)


{
  orderId: "83f87c4f989898",
  clientId: "83f87c4f-5480-41f4-84e7-b624284c272c",
  status: "pending"
}

exemplo de body passado pra order-service

no serviço de notification vamos consultar um json
(mock de clients para pegar o seu email ou n° para enviar a notificação)

npx prisma migrate dev --name init
criação do schema de order com prisma_orm