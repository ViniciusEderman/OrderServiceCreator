#  Order Orchestrator

> Serviço de orquestração responsável por criar, atualizar e publicar pedidos(Orders) para outros microsserviços via mensageria.  
> O foco principal do projeto é **aplicar conceitos avançados de arquitetura limpa, DDD e SOLID**, com ênfase em **testabilidade, desacoplamento e robustez**.

---

##  Arquitetura

O projeto segue os princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**, garantindo baixo acoplamento entre camadas e alta testabilidade.

### Camadas

- **Domain** → Entidades, tipos e interfaces puras, sem dependências externas.  
- **Application (Use Cases)** → Contém os fluxos de negócio (`create-order`, `update-order`) e regras de orquestração.  
- **Infra** → Implementa as interfaces definidas no domínio (RabbitMQ, PostgreSQL, HTTP via Fastify, etc).  
- **Shared/Core** → Contém abstrações reutilizáveis (`Result`, `Exception`, `Logger`).

##  Principais Casos de Uso

### 1️ -> `CreateOrder`
Cria uma nova `Order` associada a um `clientId`, persiste no banco via Prisma e publica o evento na fila RabbitMQ.

```ts
await orderOrchestrator.createOrderAndPublisher({
  clientId: "12345",
  status: "CREATED",
});
```

### 2 -> `UpdateOrderStatus`
Atualiza o status de uma Order existente, persiste a alteração e publica o evento atualizado.

```ts
await orderOrchestrator.updateOrderAndPublisher({
  orderId: "uuid",
  newStatus: "DELIVERED",
});
```

### Entidade Principal: Order
A entidade Order é o coração do domínio, responsável por representar o ciclo de vida de uma ordem e manter o histórico de status (statusHistory).
```ts
export class Order extends Entity<OrderProps> {
  get currentStatus(): Status {
    return this.props.statusHistory.at(-1).status;
  }

  updateStatus(newStatus: Status) {
    if (this.currentStatus === newStatus) return;
    this.props.statusHistory.push({ status: newStatus, updatedAt: new Date() });
  }

  static create(props: Optional<OrderProps, "createdAt" | "updatedAt">, id?: UniqueEntityID) {
    return new Order(
      { ...props, createdAt: props.createdAt || new Date(), updatedAt: props.updatedAt || null },
      id
    );
  }
}
```
-Mantém invariantes de domínio

-Garante consistência do histórico

-Possui Named Constructor (create()) para padronizar a criação

-É imutável externamente, garantindo encapsulamento

### 3 -> Mensageria com RabbitMQ
A publicação e o consumo de eventos são feitos via RabbitMQ, abstraído por uma interface MessageBroker, permitindo total desacoplamento da tecnologia.

#### Mecanismo de Retry:
-Quando a fila principal está indisponível

-As mensagens são enviadas para uma fila temporária;

-Essa fila armazena os eventos até a fila principal retornar;

-Um worker faz a replicação automática assim que o sistema se estabiliza.

-Esse mecanismo garante:

-Resiliência a falhas temporárias

-Consistência eventual

-Não há perda de mensagens

### 4 -> Testabilidade e Coverage
Testes escritos com Vitest, utilizando mocks de repositórios e brokers para garantir isolamento da camada de domínio.

#### Scripts principais:
npm run test

npm run coverage

### 5 -> Tratamento de Erros com Result Pattern
Em vez de lançar exceções, o projeto utiliza um Result Pattern para representar sucesso ou falha de forma segura.

```ts
const result = await createOrder.execute(request);

if (!result.isSuccess) {
  logger.error("Error creating order", { error: result.getError() });
  return Result.fail(result.getError());
}
```
-Sem try/catch em excesso
-Testes unitários mais simples
-Fluxos previsíveis de erro

### 6 -> Injeção de Dependência
A aplicação usa o Tsyringe para aplicar o princípio de Inversão de Dependência (DIP) do SOLID.
Todas as dependências são injetadas via interface:

```ts
@injectable()
export class PublisherOrder {
  constructor(@inject("MessageBroker") private broker: MessageBroker) {}
}
```
Isso permite substituir o RabbitMQ, Prisma ou Logger por qualquer outra implementação sem alterar o domínio.

# Objetivo do Projeto
#### Este projeto é um laboratório de estudo e aplicação prática de arquitetura backend, não um MVP comercial.
#### Foco principal:
-Clean Architecture e DDD

-Inversão de dependência (DIP)

-Resiliência e retry em mensageria

-Testes unitários e coverage

-Docker + DevOps para simular ambiente real

Futuramente será integrado a um serviço de notificações (SMS/Email), com implantação em Kubernetes, load balancing, failover e CI/CD, expandindo o aprendizado para práticas de DevOps e observabilidade.

# Autor
Vinicius Ederman

Desenvolvedor Backend focado em arquitetura limpa, mensageria e sistemas distribuídos.
 [vinicius-edermanmc@hotmail.com]