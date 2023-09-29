import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    try {
      await OrderModel.update(
        {
          customer_id: entity.customerId,
          total: entity.total(),
          items: entity.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
        {
          where: {
            id: entity.id
          },
        }
      )
    } catch (error) {
      throw new Error("Order could not be updated");
    }
  }

  async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: {
          id,
        },
        include: [{ model: OrderItemModel }],
        rejectOnEmpty: true,
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const itens = orderModel.items.map((item) => {
      const itemOrder = new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)

      return itemOrder
    })

    const order = new Order(orderModel.id, orderModel.customer_id, itens);

    return order;
  }

  async findAll(): Promise<Order[]> {
    let orderModelList;
    try {
      orderModelList = await OrderModel.findAll({
        include: [{ model: OrderItemModel }],
      });
    } catch (error) {
      throw new Error("Orders not found");
    }

    const orderModelListCreated = orderModelList.map((orderModel) => {

      const itens = orderModel.items.map((item) => {
        const itemOrder = new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity)
  
        return itemOrder
      })
  
      const order = new Order(orderModel.id, orderModel.customer_id, itens);
  
      return order;
    })

    return orderModelListCreated
  }  
}
