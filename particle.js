class Particle {
  constructor(pos) {
    this.pos = pos;
    this.prevPositions = [this.pos.copy()];
    this.lifeTime = frameCount + 60*1.4;
  }

  show() {
    colorMode(HSB);
    stroke(100);
    strokeWeight(0.3);
    noFill();

    beginShape();
    //loop through each particle and create a line of where it was
    for (let i = 0; i < this.prevPositions.length; i++) {
      let prevPos = this.prevPositions[i];
      let coord = coord2win([prevPos.x, prevPos.y]);
      curveVertex(coord[0], coord[1]);
    }
    endShape();
  }

  move(vector) {
    vector.div(FRAMERATE);
    vector.limit(1);
    this.pos.add(vector);
    if (this.lifeTime > frameCount) {
      this.prevPositions.unshift(this.pos.copy());
      this.prevPositions.splice(60);
    } else {
      this.prevPositions.pop();
    }
  }
}
