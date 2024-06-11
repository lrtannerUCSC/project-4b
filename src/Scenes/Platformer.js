class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
        this.my = { sprite: {} };
        this.lanes = [
            game.config.height / 4 - 15,       // Lane 1
            game.config.height / 2,       // Lane 2
            (game.config.height * 3) / 4 + 15 // Lane 3
        ];
        this.rangeUp = 1.01;
        this.healthUp = 1.01;
        this.attackSpeedUp = .99;
        this.speedUp = 1.01;
        this.damageUp = 1.01;

        this.upgradeCosts = {
            hp: 50,
            speed: 50,
            range: 50,
            damage: 50
        };
        this.upgradeMultipliers = {
            hp: 1.5,
            speed: 1.5,
            range: 1.5,
            damage: 1.5
        };
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.atlas("characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });


        //audio
        this.load.audio('troop1_attack', '/Audio/impactPlate_heavy_003.ogg');
        this.load.audio('troop2_attack', '/Audio/impactPlate_medium_002.ogg');
        this.load.audio('troop3_attack', '/Audio/impactTin_medium_000.ogg');
        this.load.audio('troop4_attack', '/Audio/impactMetal_light_002.ogg');

        this.load.audio('troop1_summon', '/Audio/impactMining_000.ogg');
        this.load.audio('troop2_summon', '/Audio/impactMining_001.ogg');
        this.load.audio('troop3_summon', '/Audio/impactMining_002.ogg');
        this.load.audio('troop4_summon', '/Audio/impactMining_003.ogg');

        this.load.audio('troop_death', '/Audio/impactWood_medium_004.ogg')
    }

    create() {
        let my = this.my;
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 45, 25);
        

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);
        this.groundLayer.setScale(3);
        this.treeLayer = this.map.createLayer("Trees", this.tileset, 0, 0);
        this.treeLayer.setScale(3);
        if (!my.sprite.player1) {
            my.sprite.player1 = this.add.sprite(game.config.width * 0.95, game.config.height / 2, "characters", "player1");
            my.sprite.player1.setScale(4);
            my.sprite.player1.selectedLane = 1;  // Default to middle lane
            my.sprite.player1.hp = 2000;
            my.sprite.player1.currency = 100;      // Start with 0 currency
            my.sprite.player1.incomeRate = 1;    // Initial passive income rate
            my.sprite.player1.currencyText = this.add.text(game.config.width - 300, game.config.height - 50, 'Currency: 0', { fontSize: '20px', fill: '#ffffff' });
            my.sprite.player1.winText = this.add.text(my.sprite.player1.x-200, game.config.height/2 - 200, 'You Win :)', { fontSize: '40px', fill: '#ffffff' });
            my.sprite.player1.loseText = this.add.text(my.sprite.player1.x-200, game.config.height/2 - 200, 'You Lose :(', { fontSize: '40px', fill: '#ffffff' });
            my.sprite.player1.winText.visible = false;
            my.sprite.player1.loseText.visible = false;
            
        }
        if (!my.sprite.player2) {
            my.sprite.player2 = this.add.sprite(game.config.width * 0.05, game.config.height / 2, "characters", "player2");
            my.sprite.player2.setScale(4);
            my.sprite.player2.selectedLane = 1;  // Default to middle lane
            my.sprite.player2.hp = 2000;
            my.sprite.player2.currency = 100;      // Start with 0 currency
            my.sprite.player2.incomeRate = 1;    // Initial passive income rate
            my.sprite.player2.currencyText = this.add.text(20, game.config.height - 50, 'Currency: 0', { fontSize: '20px', fill: '#ffffff' });
            my.sprite.player2.winText = this.add.text(my.sprite.player2.x-50, game.config.height/2 - 200, 'You Win :)', { fontSize: '40px', fill: '#ffffff' });
            my.sprite.player2.loseText = this.add.text(my.sprite.player2.x-50, game.config.height/2 - 200, 'You Lose :(', { fontSize: '40px', fill: '#ffffff' });
            my.sprite.player2.winText.visible = false;
            my.sprite.player2.loseText.visible = false;
            
        }
        if (my.sprite.player1 && my.sprite.player2) {
            this.createTroops();
        }
        //restart key
        this.input.keyboard.on('keydown-B', () => {
            // Restart the scene
            this.resetGame();
        });

        // Initialize troop summon keybinds (Player 1)
this.initializeKeybinds(
    my.sprite.player2,
    Phaser.Input.Keyboard.KeyCodes.A,
    Phaser.Input.Keyboard.KeyCodes.S,
    Phaser.Input.Keyboard.KeyCodes.D,
    Phaser.Input.Keyboard.KeyCodes.F,
    Phaser.Input.Keyboard.KeyCodes.Q,
    Phaser.Input.Keyboard.KeyCodes.W,
    Phaser.Input.Keyboard.KeyCodes.E,
    Phaser.Input.Keyboard.KeyCodes.ONE,
    Phaser.Input.Keyboard.KeyCodes.TWO,
    Phaser.Input.Keyboard.KeyCodes.THREE,
    Phaser.Input.Keyboard.KeyCodes.FOUR
);

// Initialize troop summon keybinds (Player 2)
this.initializeKeybinds(
    my.sprite.player1,
    Phaser.Input.Keyboard.KeyCodes.H,
    Phaser.Input.Keyboard.KeyCodes.J,
    Phaser.Input.Keyboard.KeyCodes.K,
    Phaser.Input.Keyboard.KeyCodes.L,
    Phaser.Input.Keyboard.KeyCodes.U,
    Phaser.Input.Keyboard.KeyCodes.I,
    Phaser.Input.Keyboard.KeyCodes.O,
    Phaser.Input.Keyboard.KeyCodes.SEVEN,
    Phaser.Input.Keyboard.KeyCodes.EIGHT,
    Phaser.Input.Keyboard.KeyCodes.NINE,
    Phaser.Input.Keyboard.KeyCodes.ZERO
);

    
        // Set up passive income
        this.time.addEvent({
            delay: 1000,                // 1 second interval
            callback: this.passiveIncome,
            callbackScope: this,
            loop: true
        });
    }

    resetGame() {
        let my = this.my;
    
        // Reset player health and currency
        my.sprite.player1.hp = 2000;
        my.sprite.player2.hp = 2000;
        my.sprite.player1.currency = 100;
        my.sprite.player2.currency = 100;
        my.sprite.player1.incomeRate = 1;
        my.sprite.player2.incomeRate = 1;
        my.sprite.player1.setVisible(true).setActive(true).setPosition(game.config.width * 0.95, game.config.height / 2);
        my.sprite.player2.setVisible(true).setActive(true).setPosition(game.config.width * 0.05, game.config.height / 2);

        my.sprite.player1.alpha = 1;
        my.sprite.player2.alpha = 1;

        my.sprite.player1.winText.visible = false
        my.sprite.player1.loseText.visible = false
        my.sprite.player2.winText.visible = false
        my.sprite.player2.loseText.visible = false

        
    }
    resetTroopGroup(troopGroup) {
        troopGroup.children.iterate((troop) => {
            troop.setActive(false).setVisible(false);
            troop.inCombat = false;
            troop.x = -200; // Off-screen position
            troop.y = -200; // Off-screen position
        });
    }
    
    passiveIncome() {
        let my = this.my;
        my.sprite.player1.currency += my.sprite.player1.incomeRate;
        my.sprite.player2.currency += my.sprite.player2.incomeRate;
    
        // Update the currency display
        my.sprite.player1.currencyText.setText('Currency: ' + Math.floor(my.sprite.player1.currency));
        my.sprite.player2.currencyText.setText('Currency: ' + Math.floor(my.sprite.player2.currency));
    
        // Increase income rate over time
        my.sprite.player1.incomeRate += 0.1;
        my.sprite.player2.incomeRate += 0.1;
    }
    

    initializeKeybinds(player, key1, key2, key3, key4, lane1Key, lane2Key, lane3Key, up1Key, up2Key, up3Key, up4Key) {
        player.summonTroop1 = this.input.keyboard.addKey(key1);
        player.summonTroop2 = this.input.keyboard.addKey(key2);
        player.summonTroop3 = this.input.keyboard.addKey(key3);
        player.summonTroop4 = this.input.keyboard.addKey(key4);
        player.lane1 = this.input.keyboard.addKey(lane1Key);
        player.lane2 = this.input.keyboard.addKey(lane2Key);
        player.lane3 = this.input.keyboard.addKey(lane3Key);
        player.up1 = this.input.keyboard.addKey(up1Key);
        player.up2 = this.input.keyboard.addKey(up2Key);
        player.up3 = this.input.keyboard.addKey(up3Key);
        player.up4 = this.input.keyboard.addKey(up4Key);


        player.summonTroop1.on('down', (key, event) => {
            this.summonTroop(player, player.troop1Group, 7);  // Cost of troop 1
            this.sound.play('troop1_summon');

        });
        player.summonTroop2.on('down', (key, event) => {
            this.summonTroop(player, player.troop2Group, 1);  // Cost of troop 2
            this.sound.play('troop2_summon');
        });
        player.summonTroop3.on('down', (key, event) => {
            this.summonTroop(player, player.troop3Group, 3);  // Cost of troop 3
            this.sound.play('troop3_summon');
        });
        player.summonTroop4.on('down', (key, event) => {
            this.summonTroop(player, player.troop4Group, 100);  // Cost of troop 4
            this.sound.play('troop4_summon');
        });

        player.lane1.on('down', () => {
            player.selectedLane = 0; // Top lane
            console.log('Lane 1 selected');
        });
        player.lane2.on('down', () => {
            player.selectedLane = 1; // Middle lane
            console.log('Lane 2 selected');
        });
        player.lane3.on('down', () => {
            player.selectedLane = 2; // Bottom lane
            console.log('Lane 3 selected');
        });

        player.up1.on('down', () => {
            this.handleUpgrade(player, 'hp', this.healthUp);
        });

        player.up2.on('down', () => {
            this.handleUpgrade(player, 'speed', this.speedUp);
        });

        player.up3.on('down', () => {
            this.handleUpgrade(player, 'range', this.rangeUp);
        });

        player.up4.on('down', () => {
            this.handleUpgrade(player, 'damage', this.damageUp);
        });
        
    }

    handleUpgrade(player, upgradeType, upgradeValue) {
        if (player.currency >= this.upgradeCosts[upgradeType]) {
            this.upgradeTroops(player, upgradeType, upgradeValue);
            player.currency -= this.upgradeCosts[upgradeType];
            player.currencyText.setText('Currency: ' + Math.floor(player.currency));

            // Increase the cost exponentially
            this.upgradeCosts[upgradeType] *= this.upgradeMultipliers[upgradeType];
        } else {
            console.log("Not enough currency to upgrade " + upgradeType);
        }
    }

    summonTroop(player, troopGroup, cost) {
        if (player.currency >= cost) {
            let troop = troopGroup.getFirstDead();
            if (troop && troop.frame.name !== "troop4") {
                troop.x = player.x;
                troop.y = this.lanes[player.selectedLane];
                troop.setActive(true);
                troop.setVisible(true);
                troop.inCombat = false;
                troop.hp = 100;
                player.currency -= cost;  // Deduct cost
                // Update the currency display immediately after summoning
                player.currencyText.setText('Currency: ' + player.currency);
                // console.log(`Troop Summoned by Player at position (${troop.x}, ${troop.y})`);
            } else {
                if (player == this.my.sprite.player1){
                    troop.x = player.x - 50;
                }else{
                    troop.x = player.x + 50;
                }
                troop.y = this.lanes[player.selectedLane];
                troop.setActive(true);
                troop.setVisible(true);
                troop.inCombat = false;
                troop.hp = 100;
                player.currency -= cost;  // Deduct cost
                // Update the currency display immediately after summoning
                player.currencyText.setText('Currency: ' + player.currency);
                // console.log(`Troop Summoned by Player at position (${troop.x}, ${troop.y})`);
            }
        } else {
            console.log("Not enough currency to summon troop.");
        }
    }

    update() {
        this.checkWin();
        this.moveTroops();
        this.troopCollisionCheck();
        this.troopCombat();
        this.generateCurrencyForTroop4(); // Add this line to call the new method
    }
    
    generateCurrencyForTroop4() {
        const player1 = this.my.sprite.player1;
        const player2 = this.my.sprite.player2;
    
        [player1.troop4Group, player2.troop4Group].forEach(troop4Group => {
            troop4Group.children.iterate(troop4 => {
                // Check if troop4 is visible
                if (troop4.visible) {
                    // Assign the currency earning rate for troop4
                    const currencyRate = 0.05; // Adjust as needed
                    // Determine the associated player based on the troop's parent group
                    const player = (troop4Group === player1.troop4Group) ? player1 : player2;
                    // Generate currency for the player based on the rate
                    console.log("added money");
                    player.currency += currencyRate;
                    // Update the currency display for the player
                    player.currencyText.setText('Currency: ' + Math.floor(player.currency));
                }
            });
        });
    }
    
    
    
    

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    createTroops() {
        let my = this.my;

        // Player 1 Troops
        my.sprite.player1.troop1Group = this.createTroopGroup("troop1", { range: 10, speed: .25, damage: 30, attackSpeed: 900, hp: 250 });
        my.sprite.player1.troop2Group = this.createTroopGroup("troop2", { range: 20, speed: .5, damage: 15, attackSpeed: 300, hp: 75 });
        my.sprite.player1.troop3Group = this.createTroopGroup("troop3", { range: 150, speed: .25, damage: 12, attackSpeed: 450, hp: 30 });
        my.sprite.player1.troop4Group = this.createTroopGroup("troop4", { range: 0, speed: 0, damage: 0, attackSpeed: 600, hp: 500 });

        // Player 2 Troops
        my.sprite.player2.troop1Group = this.createTroopGroup("troop1", { range: 10, speed: .25, damage: 30, attackSpeed: 900, hp: 250 });
        my.sprite.player2.troop2Group = this.createTroopGroup("troop2", { range: 20, speed: .5, damage: 15, attackSpeed: 300, hp: 75 });
        my.sprite.player2.troop3Group = this.createTroopGroup("troop3", { range: 150, speed: .25, damage: 12, attackSpeed: 450, hp: 30 });
        my.sprite.player2.troop4Group = this.createTroopGroup("troop4", { range: 0, speed: 0, damage: 0, attackSpeed: 600, hp: 500 });

        // Populate troop groups with initial troops
        this.populateTroopGroup(my.sprite.player1.troop1Group, 100);
        this.populateTroopGroup(my.sprite.player1.troop2Group, 100);
        this.populateTroopGroup(my.sprite.player1.troop3Group, 100);
        this.populateTroopGroup(my.sprite.player1.troop4Group, 100);

        this.populateTroopGroup(my.sprite.player2.troop1Group, 100);
        this.populateTroopGroup(my.sprite.player2.troop2Group, 100);
        this.populateTroopGroup(my.sprite.player2.troop3Group, 100);
        this.populateTroopGroup(my.sprite.player2.troop4Group, 100);

        this.player1Troops = [
            this.my.sprite.player1.troop1Group,
            this.my.sprite.player1.troop2Group,
            this.my.sprite.player1.troop3Group,
            this.my.sprite.player1.troop4Group
        ];
    
        this.player2Troops = [
            this.my.sprite.player2.troop1Group,
            this.my.sprite.player2.troop2Group,
            this.my.sprite.player2.troop3Group,
            this.my.sprite.player2.troop4Group
        ];
    }

    

    createTroopGroup(frame, attributes) {
        return this.add.group({
            defaultKey: "characters",
            maxSize: 50,
            createCallback: (troop) => {
                troop.setFrame(frame);
                troop.setActive(false);
                troop.setVisible(false);
                troop.inCombat = false; // Initialize the inCombat flag
                troop.attributes = attributes; // Assign the attributes to each troop
                troop.lastAttackTime = 0; // Track the last attack time
            }
        });
    }

    populateTroopGroup(troopGroup, count) {
        for (let i = 0; i < count; i++) {
            troopGroup.create(-200, -200); // Create troops but set them inactive initially
        }
    }


    troopCollisionCheck() {
    
        for (let i = 0; i < this.player1Troops.length; i++) {
            for (let j = 0; j < this.player2Troops.length; j++) {
                this.checkGroupCollisions(this.player1Troops[i], this.player2Troops[j]);
            }
        }
    }

    checkGroupCollisions(group1, group2) {
        group1.children.iterate((troop1) => {
            group2.children.iterate((troop2) => {
                if (troop1.visible && troop2.visible && this.collides(troop1, troop2)) {
                    troop1.inCombat = true;
                    troop2.inCombat = true;
                    //console.log(`${troop1.frame.name} collided with ${troop2.frame.name}`);
                }
            }, this);
        }, this);
    }

    moveTroops() {
        let my = this.my;

    
        // Move and interact Player 1's troops with Player 2's troops
        for (let i = 0; i < this.player1Troops.length; i++) {
            for (let j = 0; j < this.player2Troops.length; j++) {
                this.moveGroup(this.player1Troops[i], this.player2Troops[j], -1);
                this.moveGroup(this.player2Troops[j], this.player1Troops[i], 1);
            }
        }
    }

    moveGroup(group, enemyGroup, direction) {
        group.children.iterate((troop) => {
            if (troop.visible && !troop.inCombat) {
                let nearestEnemy = this.findNearestEnemy(troop, enemyGroup);
                if (nearestEnemy && this.distance(troop, nearestEnemy) <= troop.attributes.range) {
                    troop.inCombat = true;
                } else {
                    troop.x += troop.attributes.speed * direction;
                }
            }
        });
    }

    distance(troop1, troop2) {
        let dx = troop1.x - troop2.x;
        let dy = troop1.y - troop2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findNearestEnemy(troop, enemyGroup) {
        let nearestEnemy = null;
        let minDistance = troop.attributes.range;

        enemyGroup.children.iterate((enemy) => {
            if (enemy.visible) {
                let distance = this.distance(troop, enemy);
                if (distance <= minDistance) {
                    minDistance = distance;
                    nearestEnemy = enemy;
                }
            }
        });

        return nearestEnemy;
    }

    troopCombat() {
        let my = this.my;

        for (let i = 0; i < this.player1Troops.length; i++) {
            for (let j = 0; j < this.player2Troops.length; j++) {
                this.performCombat(this.player1Troops[i], this.player2Troops[j]);
            }
        }
    }

    upgradeTroops(player, upgradeType, upgradeValue) {
        console.log('Upgrading troops for player:', player);
        let playerTroopGroups = [];
        if (player === this.my.sprite.player1) {
            playerTroopGroups = this.player1Troops;
        } else if (player === this.my.sprite.player2) {
            playerTroopGroups = this.player2Troops;
        } else {
            console.error('Invalid player:', player);
            return;
        }
    
        // Iterate through each troop group of the player
        for (let troopGroup of playerTroopGroups) {
            console.log('Upgrading troop group:', troopGroup);
            // Iterate through each troop in the troop group
            troopGroup.children.iterate((troop) => {
                console.log('Upgrading troop:', troop);
                // Log current troop attributes before upgrade
                console.log(`Troop attributes before upgrade - HP: ${troop.attributes.hp}, Speed: ${troop.attributes.speed}, Damage: ${troop.attributes.damage}, Attack Speed: ${troop.attributes.attackSpeed}, Range: ${troop.attributes.range}`);
                
                // Update the troop's attributes based on the upgrade type  
                switch (upgradeType) {
                    case 'range':
                        troop.attributes.range *= upgradeValue;
                        console.log(`Troop range increased, ${troop.attributes.range}`);
                        break;
                    case 'speed':
                        troop.attributes.speed *= upgradeValue;
                        console.log(`Troop speed increased, ${troop.attributes.speed}`);
                        break;
                    case 'damage':
                        troop.attributes.damage *= upgradeValue;
                        console.log(`Troop damage increased, ${troop.attributes.damage}`);
                        break;
                    case 'attackSpeed':
                        troop.attributes.attackSpeed *= upgradeValue;
                        console.log(`Troop attack speed increased, ${troop.attributes.attackSpeed}`);
                        break;
                    case 'hp':
                        troop.attributes.hp *= upgradeValue;
                        troop.setScale(troop.scaleX * 1.5); // Ensure this is the intended behavior
                        console.log(`Troop health and size increased, ${troop.attributes.hp}`);
                        break;
                    default:
                        console.error("Invalid upgrade type.");
                }
    
                // Log updated troop attributes after upgrade
                console.log(`Troop attributes after upgrade - HP: ${troop.attributes.hp}, Speed: ${troop.attributes.speed}, Damage: ${troop.attributes.damage}, Attack Speed: ${troop.attributes.attackSpeed}, Range: ${troop.attributes.range}`);
            });
        }
    }
    
    

    checkWin() {
        if (this.my.sprite.player1.hp <= 0) {
            // Player 2 wins
            this.displayWinMessage("Player 2");
        } else if (this.my.sprite.player2.hp <= 0) {
            // Player 1 wins
            this.displayWinMessage("Player 1");
        }
    }
    
    displayWinMessage(winner) {
        let my = this.my;
        // Display a message indicating the winner
        console.log(`${winner} wins the game!`);
        if (winner == "Player 1"){
            my.sprite.player1.winText.visible = true;
            my.sprite.player2.loseText.visible = true;
        }else{
            my.sprite.player2.winText.visible = true;
            my.sprite.player1.loseText.visible = true;
        }
    
        // Make all troops invisible and out of combat
        this.my.sprite.player1.troop1Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player2.troop1Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player1.troop2Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player2.troop2Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player1.troop3Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player2.troop3Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player1.troop4Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
        this.my.sprite.player2.troop4Group.children.iterate((troop) => {
            troop.setVisible(false);
            troop.inCombat = false;
        });
    }

    performCombat(group1, group2) {
        let my = this.my;
        group1.children.iterate((troop1) => {
            if (troop1.visible && troop1.x - troop1.attributes.range <= my.sprite.player2.x){
                troop1.inCombat = true;
                this.resolveAttack(troop1, my.sprite.player2, -1);
            } else {
                group2.children.iterate((troop2) => {
                    if (troop2.visible && troop2.x + troop2.attributes.range >= my.sprite.player1.x){
                        troop2.inCombat = true;
                        this.resolveAttack(troop2, my.sprite.player1, 1);
                    } else {
                        if (troop1.visible && troop2.visible && (troop1.inCombat == true || troop2.inCombat == true)) {
                            if (troop1.inCombat && troop2.inCombat) {
                                // Troops are already in combat, continue fighting
                                if (!troop1.isAttacking){
                                    this.resolveAttack(troop1, troop2, -1);
                                }
                                if (!troop2.isAttacking){
                                    this.resolveAttack(troop2, troop1, 1);
                                }
                            } else if (!troop1.inCombat && troop2.inCombat) {
                                // Troop 1 starts the attack
                                if (!troop1.isAttacking){
                                    this.resolveAttack(troop1, troop2, -1);
                                }
                            } else if (troop1.inCombat && !troop2.inCombat) {
                                // Troop 2 starts the attack
                                if (!troop2.isAttacking){
                                    this.resolveAttack(troop2, troop1, 1);
                                }
                            } else {
                                // Neither troop is in combat, so both start the attack
                                if (!troop1.isAttacking){
                                    this.resolveAttack(troop1, troop2, -1);
                                }
                                if (!troop2.isAttacking){
                                    this.resolveAttack(troop2, troop1, 1);
                                }
                            }
                            // // Check if any troop's HP reaches 0 and remove it if so
                            // if (troop1.hp <= 0) {
                            //     console.log('Troop 1 has died with HP: ' + troop1.hp);
                            //     this.removeTroop(troop1);
                            // }
                            // if (troop2.hp <= 0) {
                            //     console.log('Troop 2 has died with HP: ' + troop2.hp);
                            //     this.removeTroop(troop2);
                            // }
                            // if (troop1.hp <= 0 || troop2.hp <= 0) {
                            //     troop1.inCombat = false;
                            //     troop2.inCombat = false;
                            // }
                        }
                    }
                }, this);
            }
        }, this);
    }
    

    removeTroop(troop) {
        troop.setActive(false).setVisible(false);
        troop.x = -200;
        troop.y = -200;
        // Optionally, you can also destroy the troop if necessary
        // troop.destroy();
    }

    resolveAttack(attacker, defender, attackDir) {
        attacker.isAttacking = true;
        // Play attack sound based on attacker type
        if (defender != this.my.sprite.player1 && defender != this.my.sprite.player2){
            switch (attacker.frame.name) {
                case 'troop1':
                    this.sound.play('troop1_attack');
                    break;
                case 'troop2':
                    this.sound.play('troop2_attack');
                    break;
                case 'troop3':
                    this.sound.play('troop3_attack');
                    break;
                case 'troop4':
                    this.sound.play('troop4_attack');
                    break;
                default:
                    // Default sound or error handling
                    break;
            }
        }
        // Perform the attack animation sequence
        this.attackAnimation(attacker, attackDir, () => {
            attacker.isAttacking = false;
            if (defender.hp <= 0){
                attacker.inCombat = false;
                return;
            }
            // Check if enough time has passed since the last attack
            let currentTime = this.time.now;
            if (currentTime - attacker.lastAttackTime >= attacker.attributes.attackSpeed) {
                // Perform the attack
                defender.hp -= attacker.attributes.damage;
                console.log(`${attacker.frame.name} attacked ${defender.frame.name} causing ${attacker.attributes.damage} damage. Defender's HP: ${defender.hp}`);
                if (attacker.frame.name === 'troop4'){
                    return;
                }else{
            
                    
                    // Update last attack time
                    attacker.lastAttackTime = currentTime;
        
                    // Apply the damage effect to the defender
                    this.damageEffect(defender);
        
                    if (defender.hp <= 0) {
                        // If defender's HP reaches 0 or below, remove the troop
                        console.log(`${defender.frame.name} has died with HP: ${defender.hp}`);
                        attacker.inCombat = false;
                        defender.inCombat = false;
                        this.sound.play('troop_death');
                        this.removeTroop(defender);
                    }
                }
            }
            
        });
    }
    
    awardCurrency(attacker, attackDir, amount) {
        if (attackDir == -1) {
            this.my.sprite.player1.currency += amount;
            console.log("added currency from troop4 to player1");
            this.my.sprite.player1.currencyText.setText('Currency: ' + Math.floor(this.my.sprite.player1.currency));
        } else if (attackDir == 1) {
            this.my.sprite.player2.currency += amount;
            console.log("added currency from troop4 to player2");
            this.my.sprite.player2.currencyText.setText('Currency: ' + Math.floor(this.my.sprite.player2.currency));
        }
    }
    

    attackAnimation(attacker, attackDir, onComplete) {
        // Determine the rotation direction based on the player
    
        // Play attack animation for the attacker troop
        let attackTween = this.tweens.add({
            targets: attacker,
            angle: 30 * attackDir, // Use troop's attack angle with direction
            duration: attacker.attributes.attackSpeed*2, // Half the duration for one direction
            yoyo: true, // Yoyo back to original angle
            repeat: 0, // Repeat once for back and forth motion
            onComplete: onComplete // Callback function to execute after the animation is complete
        });
    }
    
    damageEffect(troop) {
        // Save the original tint
        let originalTint = troop.tint;
    
        // Set the tint to white
        troop.setTint(0xffffff);
    
        // Create a tween to change the tint back to normal
        this.tweens.add({
            targets: troop,
            alpha: 0.1,
            duration: 50,
            yoyo: true,
            repeat: 4,
            onComplete: () => {
                troop.clearTint();
            }
        });
    }
    

}
