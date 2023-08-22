// Define your components
class PositionComponent {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
}

class VelocityComponent {
  constructor() {
    this.x = 0
    this.y = 0
  }
}

class RenderComponent {
  constructor(sprite) {
    this.sprite = PIXI.Sprite.from(sprite.texture)
    this.sprite.height = sprite.height
    this.sprite.width = sprite.width
  }
}

class TextureComponent {
  constructor(texture) {
    this.texture = texture
  }
}

class SizeComponent {
  constructor(width, height) {
    this.width = width
    this.height = height
  }
}

class SpriteComponent {
  constructor(size, texture) {
    this.width = size.width
    this.height = size.height
    this.texture = texture
  }
}

class GravityComponent { 
  constructor() {
  }
}

class MoveWithInputComponent {
  constructor() {}
}

class VelocitySystem {
  constructor(entityManager) {
    this.entityManager = entityManager
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(VelocityComponent)

    entities.forEach((entity) => {
      const velocityComponent = entity.getComponent(VelocityComponent)
      const positionComponent = entity.getComponent(PositionComponent)
      if (!velocityComponent) return

      positionComponent.x += velocityComponent.x
      positionComponent.y += velocityComponent.y
    })
  }
}

class GravitySystem {
  constructor(entityManager, screen) {
    this.entityManager = entityManager
    this.gravity = 0.5
    this.screen = screen
  }

  update(delta) {
    const entities = this.entityManager.getEntitiesWithComponents(GravityComponent)

    entities.forEach((entity) => {
      const velocityComponent = entity.getComponent(VelocityComponent)
      if (!velocityComponent) return

      const positionComponent = entity.getComponent(PositionComponent)
      const sizeComponent = entity.getComponent(SizeComponent)
      if (positionComponent.y + sizeComponent.height + velocityComponent.y < this.screen.height) {
        velocityComponent.y += this.gravity
        positionComponent.y += velocityComponent.y
      } else {
        velocityComponent.y = 0
      }

    })
  }
}

class CollisionSytem {
  constructor(entityManager) {
    this.entityManager = entityManager;
  }
  
  update() {
    const entities = this.entityManager.getEntitiesWithComponents(PositionComponent)

    entities.forEach((entity1) => {
      const position1 = entity1.getComponent(PositionComponent)
      const size1 = entity1.getComponent(SizeComponent)

      entities.forEach((entity2) => {
        if (entity1 === entity2) return

        const position2 = entity2.getComponent(PositionComponent)
        const size2 = entity2.getComponent(SizeComponent)

        if (
          position1.x < position2.x + size2.width &&
          position1.x + size1.width > position2.x &&
          position1.y < position2.y + size2.height &&
          position1.y + size1.height > position2.y
        ) {
          // Collision detected, you can implement collision response here
          console.log("Collision detected!");
        }

      })
    })
  }

}
  
class PlayerInputSystem {
  constructor(entityManager) {
    this.entityManager = entityManager;
    this.keys = {};
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
  }

  onKeyDown(event) {
    this.keys[event.key] = true;
  }

  onKeyUp(event) {
    this.keys[event.key] = false;
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(VelocityComponent);

    entities.forEach(entity => {
      if (!entity.hasComponent(MoveWithInputComponent)) return
      const velocityComponent = entity.getComponent(VelocityComponent)
      const speed = 10
      const smoothingFactor = 0.2;

      if (this.keys['a']) {
        velocityComponent.x = -speed * deltaTime;
      }
      if (this.keys['d']) {
        velocityComponent.x = speed * deltaTime;
      }
      if (this.keys['w']) {
        velocityComponent.y = -speed * deltaTime;
      }
      if (this.keys['s']) {
        velocityComponent.y = speed * deltaTime;
      }

      velocityComponent.x -= velocityComponent.x * smoothingFactor
   });
  }
}

class RenderSystem {
  constructor(entityManager, stage) {
    this.entityManager = entityManager;
    this.stage = stage;
  }

  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(RenderComponent);

    entities.forEach(entity => {
      const renderComponent = entity.getComponent(RenderComponent);

      // Update the graphics based on the entity's position
      renderComponent.sprite.position.x = entity.getComponent(PositionComponent).x;
      renderComponent.sprite.position.y = entity.getComponent(PositionComponent).y;

      // Render the graphics on the stage
      this.stage.addChild(renderComponent.sprite);
    });
  }
}
  
  // Initialize PixiJS application
  const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xAAAAAA
  });
  document.body.appendChild(app.view);
  
  // Create an entity manager
  class EntityManager {
    constructor() {
      this.entities = [];
    }
  
    createEntity() {
      const entity = new Entity();
      this.entities.push(entity);
      return entity;
    }
  
    getEntitiesWithComponents(...componentTypes) {
      return this.entities.filter(entity => {
        return componentTypes.every(componentType => entity.hasComponent(componentType));
      });
    }
  }
  
  // Define an entity class
  class Entity {
    constructor() {
      this.components = {};
    }
  
    addComponent(component) {
      this.components[component.constructor.name] = component;
    }
  
    getComponent(componentType) {
      return this.components[componentType.name];
    }
  
    hasComponent(componentType) {
      return componentType.name in this.components;
    }
  }
  
  // Create an entity manager instance
  const entityManager = new EntityManager();
  
  const sizePlayer = new SizeComponent(50, 90)
  const texture = new TextureComponent("https://pixijs.com/assets/bunny.png")

  // Create player entity
  const playerEntity = entityManager.createEntity();
  playerEntity.addComponent(sizePlayer)
  playerEntity.addComponent(texture)
  playerEntity.addComponent(new PositionComponent(400, 300));
  playerEntity.addComponent(new RenderComponent({texture: texture.texture, height: sizePlayer.height, width: sizePlayer.width}));
  playerEntity.addComponent(new MoveWithInputComponent());
  playerEntity.addComponent(new VelocityComponent())
  playerEntity.addComponent(new GravityComponent())


  const sizePlayer2 = new SizeComponent(50, 90)
  const texture2 = new TextureComponent("https://pixijs.com/assets/bunny.png")
  const otherPlayerEntity = entityManager.createEntity()
  otherPlayerEntity.addComponent(new PositionComponent(600, 300))
  otherPlayerEntity.addComponent(sizePlayer)
  otherPlayerEntity.addComponent(texture)
  otherPlayerEntity.addComponent(new RenderComponent({texture: texture2.texture, height: sizePlayer2.height, width: sizePlayer2.width}));
  otherPlayerEntity.addComponent(new VelocityComponent())
  otherPlayerEntity.addComponent(new GravityComponent())
  
  // Create systems
  const playerInputSystem = new PlayerInputSystem(entityManager);
  const renderSystem = new RenderSystem(entityManager, app.stage);
  const collisionSystem = new CollisionSytem(entityManager)
  const gravitySystem = new GravitySystem(entityManager, app.screen)
  const velocitySystem = new VelocitySystem(entityManager)
  console.log(app.screen)

  // Add systems to update loop
  app.ticker.add((deltaTime) => {
    playerInputSystem.update(deltaTime);
    collisionSystem.update()
    gravitySystem.update(deltaTime)
    velocitySystem.update(deltaTime)
    renderSystem.update(deltaTime)
    // Update other systems here
  });
  
  // Start the application loop
  app.start();
  