---
title: "Inheritance vs Composition: There's No Always Right Answer"
date: "Nov 20, 2024"
category: "cs"
tags: ["software-design", "design-pattern", "inheritance", "composition"]
excerpt: "compares inheritance and composition, emphasizing the importance of choosing the right approach based on the specific software design context."
---

## Introduction

In the world of object-oriented programming, the phrase "Composition Over Inheritance" is often heard. Many developers treat this principle as a golden rule. But is it always the best choice in every situation? I would like to dive deeper into this topic and discuss when inheritance is still valid and might even be the better choice.

## The Background of "Composition Over Inheritance"

To understand why the principle of "Composition Over Inheritance" emerged, I must first examine some fundamental problems with inheritance.

- Tight Coupling: One of the most significant issues with inheritance is the strong coupling between the parent and child classes. This strong coupling reduces code flexibility and makes changes more challenging. For example, even small changes in the parent class can have unexpected consequences for multiple child classes, a problem often referred to as the 'fragile base class problem.'

- Increased Complexity: As the inheritance hierarchy deepens, the complexity of the code increases exponentially. If I need to trace through several layers of inheritance to understand the behavior of a particular method, it can significantly reduce code readability and maintainability.

- Problems with Multiple Inheritance: Languages that support multiple inheritance face additional problems. For instance, issues like the diamond problem can arise, negatively affecting the predictability and stability of the code.

- Lack of Flexibility: Inheritance is well-suited to represent 'is-a' relationships, but many real-world situations require more flexible relationships. This can lead to inappropriate or overly complex inheritance structures.

Due to these challenges, many developers began seeking alternatives, leading to the rise of composition. The benefits of composition are particularly evident in fields such as web backend API development.

The key advantages of composition include:

- Flexibility: Composition allows for more flexible relationships between objects. For example, it’s easier to replace or mock components like services or repositories, which simplifies testing and maintenance.

- Modularity: Because each component functions independently, code modularity improves, naturally adhering to the principle of separation of concerns.

- Ease of Dependency Injection: Composition pairs well with the dependency injection pattern, reducing coupling between objects and enhancing code reusability and testability.

- Scalability: When adding new features, it’s easier to expand the system by adding new components without modifying existing code, adhering to the Open-Closed Principle.

For these reasons, "Composition Over Inheritance" has become a widely accepted guideline. However, it should be seen as a general rule rather than an absolute law. As I’ll explore in the next section, there are still cases where inheritance is more suitable.

## But There Are Times When Inheritance is Better

Despite the benefits of composition, it’s not always the best solution. In particular, inheritance remains a powerful and sometimes essential tool in event-driven client development. In this section, I’ll explore scenarios where inheritance is more appropriate.

### Inheritance in Event-Driven Client Development

In event-driven client development, especially in GUI applications or game development, inheritance plays a vital role. Here’s why inheritance is useful in such environments:

- Consistent Event Handling: I can define common event handling logic in a base class, allowing child classes to extend or override it. This maintains code consistency while enabling customized behavior for specific components.

- Lifecycle Management: I can manage the lifecycle (initialization, updating, rendering, destruction, etc.) of UI components or game objects in a base class, ensuring that all objects follow a consistent lifecycle.

- Natural Expression of Hierarchical Structures: UI elements or game entities often follow hierarchical structures, and inheritance allows these structures to be naturally expressed in code.

### Applications with Strong Global State Dependencies

In applications where all logic strongly depends on global state, inheritance can be more effective than composition. Here's why:

- Avoiding Unnecessary Decoupling: If all components must eventually access the same global state, decoupling through composition and dependency injection might introduce unnecessary complexity. Inheritance can encapsulate access to global state, making the code more intuitive and manageable.

- Centralization of Common Logic: By implementing global state handling logic in a parent class, I can reduce code duplication and maintain consistency, which is especially useful when managing side effects due to state changes.

- Abstraction of State Access: By abstracting access to global state through inheritance, I can limit the scope of changes in case of architectural modifications (e.g. transitioning from global to local state).

### Effective Use of the Template Method Pattern

The template method pattern is a classic example of effectively utilizing inheritance:

- Defining Algorithm Structure: By defining the basic structure of an algorithm in a parent class and allowing child classes to implement specific steps, I can increase code reusability and extendibility.

- Isolating Invariant Logic: By abstracting core logic that doesn’t change into the parent class, I can isolate it and allow changes only in the necessary parts in child classes, improving maintainability.

- Ensuring Consistency: The template method pattern ensures consistency across multiple implementations, which is especially important in large projects where many developers collaborate.

### Inheritance in Framework Design

Many frameworks are designed around inheritance. In such cases, inheritance offers the following benefits:

- Providing Extension Points: Frameworks can provide core functionality while offering clear extension points for users to customize or extend specific parts.

- Convention Over Configuration: By defining default behavior through inheritance and allowing users to override only when necessary, frameworks can implement the principle of "convention over configuration."

- Type Safety: Inheritance enables compile-time type checking, preventing potential errors during framework use.

## Conclusion

The principle of "Composition Over Inheritance" is valid in many cases, but it’s not an absolute rule. Good developers know how to choose the right tool for the right situation.

Both inheritance and composition have their strengths and weaknesses, and the choice should depend on project requirements, development context, and team preferences. The key is to fully understand the characteristics of both approaches and choose the one that best fits the problem at hand.

Moreover, over the past decade, I’ve developed applications within a relatively 'perfect' object-oriented paradigm, but there’s now an increasing need for unconventional structures and low-level development. This shift underscores the importance of more flexible, situational approaches.

In the end, great software design isn’t about blindly following dogmatic principles but about finding a balanced approach that fits the situation. Neither inheritance nor composition is always right or always wrong. As developers, my role is to understand the pros and cons of each technique, consider the evolving development environment and requirements, and choose the most suitable tools and methodologies for the task at hand. This flexible mindset is becoming increasingly important in modern software development.
