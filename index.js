const canvas = document.querySelector("canvas");
/* canvas context like canvas API */
const c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const biggerScore = document.querySelector("#biggerScore");
/* class for Player */
class Player {
  /* explicity prorieties in constructor for each new istance*/
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }
  /* function to draw the player (0 from,math.pi to do circle)*/
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}
/* define wher is player */
const x = canvas.width / 2;
const y = canvas.height / 2;
/* Bullets / blueprint*/
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  /* velocity function call */
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
/* Enemeies */
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  /* velocity function call */
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
/* blueprint for different direction if effect boom */
const friction = 0.99;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    /* fade out remove particle from screen*/
    this.alpha = 1;
  }
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }
  /* velocity function call */
  update() {
    this.draw();
    /* frizione  */
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}
/* new istance with constructor method */
let player = new Player(x, y, 10, "white");
/* array per creare direzioni bullet nello stesso momento*/
let projectiles = [];
/* array per creare nemici nello stesso momento*/
let enemies = [];
let particles = [];
/* reset */
function init() {
  player = new Player(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  biggerScore.innerHTML = score;
}
/* create Enemy */
function spawnEnemies() {
  setInterval(() => {
    /* DA 30 MINIMO 4 */
    const radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    /* provenienza enemies condizione per direzione provenienza multipla top left bottom ecc*/
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    /* provenienza enemies, random color 50% saturation and more use Math random like a computed*/
    const color = `hsl(${Math.random() * 360},50%,50%)`;
    /* DIRECTION */
    /* atan2(destination - y,) */
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      /* cos e sin produce the exactly ratio */
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    /*//. DIRECTION */
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
}
/* for differrenziare i frame (partite) */
let animationId;
let score = 0;
/* animate loop shoot */
function animate() {
  /* call self for generate the loop */
  animationId = requestAnimationFrame(animate);
  /* specific style rgba per l'effetto di movimento enemy e bullets*/
  c.fillStyle = "rgba(0,0,0,0.1)";
  /* clear canvas loop */
  c.fillRect(0, 0, canvas.width, canvas.height);
  /* create player before clear canvas */
  player.draw();
  /* draw particles */
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, index) => {
    projectile.update();
    /* remove proojectables from edges of screen */
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, index) => {
    enemy.update();
    /* enemy hit player ?? */
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    /* end game */
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      /* modal score appear */
      modalEl.style.display = "flex";
      biggerScore.innerHTML = score;
    }
    /* define when enemy are hits from bullets*/
    projectiles.forEach((projectile, projectileIndex) => {
      /* distance */
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      /* when projectail touch enemy */
      if (dist - enemy.radius - projectile.radius < 1) {
        /* create explosion */
        for (let index = 0; index < 8; index++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                /* negatve to positive -0.5*/
                /* define power of effect particel depend from size enemy */
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }
        /* shrink -10 and remove about size */
        if (enemy.radius - 10 > 5) {
          /* increase score */
          score += 100;
          scoreEl.innerHTML = score;
          /*  enemy.radius -= 10; senza gsap*/
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          /* remove bullet */
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          /* REMOVE FROM scene altoghether */
          score += 250;
          scoreEl.innerHTML = score;
          /* set timeout to remove flash effect */
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
        /*//.. shrink and remove about size */
      }
    });
  });
}
/* shoot at click */
/* to see the proprieties of event pass as argoument and console it, now we need coordinate clientY and ClientX */
addEventListener("click", (event) => {
  /* direction bullets, velocity depend 1 angle from center to the height of click take x and y to calcoulate the angle in function atan2, prodution radio sin(angle) cos(angle) */
  /* DIRECTION */
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );
  const velocity = {
    /* cos e sin produce the exactly ratio */
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
  /*//. DIRECTION */
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});
startGameBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});
